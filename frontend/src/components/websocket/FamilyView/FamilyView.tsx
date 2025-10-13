import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  ErrorInfo,
  useRef
} from 'react';
import LeftHeader from '../../LeftHeader/LeftHeader';
import ReactFamilyTree from 'react-family-tree';
import { PinchZoomPan } from './PinchZoomPan';
import { FamilyNode } from './FamilyNode';
import { NodeDetails } from './NodeDetails';
import LoadingSpinner from '../../Loader/LoadingSpinner';
import EditModal from '../Edit/Edit';
import RelationModal from '../RelationModal/RelationModal';
import Modal from '../deleteRelation/Modal';
import type { Node, ExtNode } from 'relatives-tree/lib/types';
import type { CSSProperties } from 'react';
import NotAuthenticatedScreen from '../../NotAuthenticatedScreen/NotAuthenticatedScreen';
import { SearchControlPanel } from './SearchControlPanel';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ChatMessageItem, { ChatMessage } from './ChatMessageItem';
import HistorySidebar from '../../HistorySidebar/HistorySidebar';
import axios from 'axios';

interface FamilyData {
  nodes: Node[];
  rootId: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface DisplayOptions {
  showGenderIcon: boolean;
  showShortId: boolean;
  showFullName: boolean;
  showBirthDate: boolean;
  showDeathDate: boolean;
  showDeceasedRibbon: boolean;
  showGenderColors: boolean;
}

interface Reaction {
  emoji: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}

interface EditHistory {
  previousMessage: string;
  editedAt: string;
}

interface TypingUser {
  userId: string;
  userName: string;
}

const NODE_WIDTH = 150;
const NODE_HEIGHT = 130;

const COMMON_EMOJIS = [
  '👍', '👎', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏', '🔥',
  '🤔', '👀', '🙏', '💯', '🥳', '😍', '🤯', '😴', '🙌', '💪'
];

const getNodeStyle = ({ left, top }: Readonly<ExtNode>): CSSProperties => {
  const x = left || 0;
  const y = top || 0;

  return {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    transform: `translate(${x * (NODE_WIDTH / 2)}px, ${y * (NODE_HEIGHT / 2)}px)`,
    transition: 'transform 0.3s ease-out',
  };
};

const FamilyViewWebsocket: React.FC = () => {
  const [userRole, setUserRole] = useState<'owner'|'admin' | 'editor' | 'guest'>('guest');
  const [familyData, setFamilyData] = useState<FamilyData | null>(null);
  const [selectId, setSelectId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [previousRoot, setPreviousRoot] = useState<string | null>(null);
  const [initialRootId, setInitialRootId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState<boolean>(false);
  const [isRelationDeleteModalOpen, setIsModalDeleteRelationOpen] = useState<boolean>(false);
  const [recentRoots, setRecentRoots] = useState<{ id: string; name: string }[]>([]);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
    showGenderIcon: true,
    showShortId: false,
    showFullName: true,
    showBirthDate: true,
    showDeathDate: true,
    showDeceasedRibbon: true,
    showGenderColors: false,
  });

  // Chat states
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [sendingMessages, setSendingMessages] = useState<Set<string>>(new Set());

  // Chat advanced states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageText, setEditMessageText] = useState<string>('');
  const [reactingMessageId, setReactingMessageId] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<ChatMessage | null>(null);
  const [showEditHistory, setShowEditHistory] = useState<string | null>(null);
  const [showReactionsPopup, setShowReactionsPopup] = useState<string | null>(null);

  // History state
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  const { id } = useParams<{ id: string }>();
  const wsRef = useRef<WebSocket | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const startTimeRef = useRef<number>(0);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom('auto');
    }
  }, [isChatOpen, scrollToBottom]);

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen, scrollToBottom]);

  const handleAddReaction = useCallback((messageId: string, emoji: string) => {
    if (!wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'add_reaction',
      messageId: messageId,
      emoji: emoji,
      familyTreeId: id
    }));

    setReactingMessageId(null);
  }, [id]);

  const startEditingMessage = useCallback((message: ChatMessage) => {
    if (message.user._id !== currentUser?.id) return;

    setEditingMessageId(message._id);
    setEditMessageText(message.message);
  }, [currentUser]);

  const cancelEditing = useCallback(() => {
    setEditingMessageId(null);
    setEditMessageText('');
  }, []);

  const saveEditedMessage = useCallback(() => {
    if (!wsRef.current || !editingMessageId || !editMessageText.trim()) return;

    wsRef.current.send(JSON.stringify({
      type: 'edit_message',
      messageId: editingMessageId,
      newMessage: editMessageText.trim(),
      familyTreeId: id
    }));

    setEditingMessageId(null);
    setEditMessageText('');
  }, [editingMessageId, editMessageText, id]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    if (!wsRef.current) return;

    if (window.confirm('Czy na pewno chcesz usunąć tę wiadomość?')) {
      wsRef.current.send(JSON.stringify({
        type: 'delete_message',
        messageId: messageId,
        familyTreeId: id
      }));
    }
  }, [id]);

  const startReplyingToMessage = useCallback((message: ChatMessage) => {
    setReplyingToMessage(message);
    setNewMessage('');
  }, []);

  const cancelReply = useCallback(() => {
    setReplyingToMessage(null);
  }, []);

 

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      wsRef.current?.send(JSON.stringify({
        type: 'typing_start',
        familyTreeId: id,
        userName: currentUser?.name || 'User'
      }));
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      wsRef.current?.send(JSON.stringify({
        type: 'typing_stop',
        familyTreeId: id,
        userName: currentUser?.name || 'User'
      }));
    }, 3000);
  }, [isTyping, id, currentUser]);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim() || !wsRef.current || !currentUser) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      _id: tempId,
      familyTree: id!,
      user: {
        _id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      },
      message: newMessage.trim(),
      type: 'text',
      replyTo: replyingToMessage?._id,
      readBy: [currentUser.id],
      reactions: [],
      edited: false,
      editHistory: [],
      deleted: false,
      createdAt: new Date().toISOString(),
    };

    setChatMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
    setReplyingToMessage(null);

    const messageData: any = {
      type: 'chat_message',
      message: newMessage.trim(),
      familyTreeId: id,
      tempId: tempId
    };

    if (replyingToMessage) {
      messageData.replyTo = replyingToMessage._id;
    }

    wsRef.current.send(JSON.stringify(messageData));

  }, [newMessage, id, currentUser, replyingToMessage]);

  const markMessageAsRead = useCallback((messageId: string) => {
    wsRef.current?.send(JSON.stringify({
      type: 'mark_message_read',
      messageId: messageId
    }));
  }, []);

  const loadChatHistory = useCallback(() => {
    wsRef.current?.send(JSON.stringify({
      type: 'get_chat_history',
      familyTreeId: id,
    }));
  }, [id]);

  const findReplyMessage = useCallback((messageId: string): ChatMessage | null => {
    return chatMessages.find(msg => msg._id === messageId) || null;
  }, [chatMessages]);

  const formatMessageTime = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  

  // History functions
  const handleUndoHistory = useCallback((historyId: string) => {
    if (!wsRef.current) return;
    const token = localStorage.getItem('authToken');
    axios.post(
      `http://localhost:3001/api/history/undo/${id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    wsRef.current.send(JSON.stringify({ type: 'getAllPersonsWithRelations' }));

    toast.info('Cofanie zmiany...');
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const familyTreeId = id;

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser({
          id: payload.userId,
          name: payload.name || 'User',
          email: payload.email
        });
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }

    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    startTimeRef.current = performance.now();

    ws.onopen = () => {
      console.log('Połączono z WebSocket!');
      ws.send(JSON.stringify({
        type: 'auth',
        token: token,
        familyTreeId: familyTreeId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'init':
            setUserRole(message.data.role);
            console.log(userRole)
            ws.send(JSON.stringify({ type: 'getAllPersonsWithRelations' }));
            loadChatHistory();
            break;

          case 'error':
            console.error('Błąd:', message.message);
            setLoading(false);
            break;

          case 'personUpdated':
          case 'personDeleted':
          case 'relationDeleted':
          case 'personWithRelationsAdded':
            console.log(message.type);
            if (message.type === 'personWithRelationsAdded') {
              toast.success('Dodano nową osobę do drzewa!');
            }
            if (message.type === 'relationDeleted') {
              toast.success('Usunięto relację!');
            }
            if (message.type === 'personDeleted') {
              toast.success('Usunięto osobę z drzewa!');
            }
            if (message.type === 'personUpdated') {
              toast.success('Zaktualizowano dane osoby!');
            }

            const savedRootId = localStorage.getItem('currentRootId');
            const defaultRootId = message.data[1].id;

            const rootIdToUse = savedRootId && message.data.some((node: Node) => node.id === savedRootId)
              ? savedRootId
              : defaultRootId;

            setFamilyData({
              nodes: message.data,
              rootId: rootIdToUse,
            });
            setInitialRootId(rootIdToUse);
            break;

          case 'allPersonsWithRelations':
            setFamilyData({
              nodes: message.data,
              rootId: message.data[1].id
            });
            setLoading(false);
            break;

          case 'chat_message':
            setChatMessages(prev => {
              const newMessages = prev.filter(msg =>
                !(message.data.tempId && msg._id === message.data.tempId)
              );
              return [...newMessages, message.data];
            });

            if (message.data.tempId) {
              setSendingMessages(prev => {
                const newSet = new Set(prev);
                newSet.delete(message.data.tempId);
                return newSet;
              });
            }

            if (!isChatOpen) {
              setUnreadCount(prev => prev + 1);
            } else {
              markMessageAsRead(message.data._id);
            }
            break;

          case 'message_edited':
            setChatMessages(prev => prev.map(msg =>
              msg._id === message.data._id ? message.data : msg
            ));
            break;

          case 'reaction_updated':
            setChatMessages(prev => prev.map(msg =>
              msg._id === message.data.message._id ? message.data.message : msg
            ));
            break;

          case 'message_deleted':
            setChatMessages(prev => prev.map(msg =>
              msg._id === message.data._id ? message.data : msg
            ));
            break;

          case 'edit_history':
            console.log('Edit history:', message.data);
            break;

          case 'chat_history':
            setChatMessages(message.data);
            console.log('Chat history loaded:', message.data);
            break;

          case 'typing_start':
            setTypingUsers(prev => {
              const exists = prev.find(user => user.userId === message.data.userId);
              if (!exists) {
                return [...prev, message.data];
              }
              return prev;
            });
            break;

          case 'typing_stop':
            setTypingUsers(prev => prev.filter(user => user.userId !== message.data.userId));
            break;

          case 'system_message':
            console.log('System message received:', message.data);
            console.log(message.data);

            setChatMessages(prev => [...prev, message.data]);
            break;

          case 'undo_success':
            toast.success('Pomyślnie cofnięto zmianę!');
            break;

          case 'undo_error':
            toast.error('Nie udało się cofnąć zmiany: ' + message.message);
            break;
        }
      } catch (err) {
        console.error('Błąd parsowania:', err);
        setLoading(false);
      }
    };

    ws.onerror = (error) => {
      console.error('Błąd WebSocket:', error);
      setLoading(false);
    };

    ws.onclose = () => {
      console.log('Połączenie zamknięte');
    };

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      ws.close();
    };
  }, [id, loadChatHistory, markMessageAsRead]);

  useEffect(() => {
    if (isChatOpen) {
      setUnreadCount(0);
      chatMessages.forEach(msg => {
        if (!msg.readBy.includes(currentUser?.id || '')) {
          markMessageAsRead(msg._id);
        }
      });
    }
  }, [isChatOpen, chatMessages, currentUser, markMessageAsRead]);

  useEffect(() => {
    localStorage.setItem('recentRoots', JSON.stringify(recentRoots));
  }, [recentRoots]);

  class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
      hasError: false,
      error: null
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return {
        hasError: true,
        error
      };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
      console.error("Error caught by ErrorBoundary:", error, errorInfo);
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    }

    fetchData = () => {
      const updatedRoots = recentRoots.slice(1);
      setRecentRoots(updatedRoots);
      setFamilyData(prevData => {
        const nodes = prevData?.nodes ? [...prevData.nodes] : [];
        const rootUser = nodes[0];
        return {
          nodes,
          rootId: rootUser?.id || ''
        };
      });
    }

    render(): ReactNode {
      if (this.state.hasError) {
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4">
            <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-xl max-w-md text-center border border-red-200 dark:border-red-800">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-800 dark:text-red-200">
                Tree Rendering Error
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-4">
                {this.state.error?.toString()}
              </p>
              <button
                onClick={() => this.fetchData()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        );
      }
      return this.props.children;
    }
  }

  const handleRootChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRootId = event.target.value;
    if (familyData) {
      setPreviousRoot(familyData.rootId);
      setFamilyData({ ...familyData, rootId: newRootId });
      localStorage.setItem('currentRootId', newRootId);
    }

    const selectedPerson = familyData?.nodes.find(node => node.id === newRootId);
    if (selectedPerson) {
      const updatedRoots = [
        { id: newRootId, name: `${selectedPerson.firstName} ${selectedPerson.lastName}` },
        ...recentRoots.filter(root => root.id !== newRootId)
      ].slice(0, 5);
      setRecentRoots(updatedRoots);
      localStorage.setItem('recentRoots', JSON.stringify(updatedRoots));
    }
  };

  const resetToDefaultRoot = useCallback(() => {
    if (familyData && initialRootId) {
      setFamilyData({ ...familyData, rootId: initialRootId });
      localStorage.setItem('currentRootId', initialRootId);
    }
  }, [familyData, initialRootId]);

  const goToPreviousRoot = useCallback(() => {
    if (previousRoot && familyData) {
      setFamilyData({ ...familyData, rootId: previousRoot });
      localStorage.setItem('currentRootId', previousRoot);
      setPreviousRoot(null);
    }
  }, [previousRoot, familyData]);

  const filteredNodes = useMemo(() => {
    if (!familyData) return [];
    return familyData.nodes.filter(person =>
      (`${person.firstName} ${person.lastName}`).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [familyData, searchTerm]);

  const selectedNode = useMemo(() => {
    if (!familyData || !selectId) return null;
    return familyData.nodes.find(node => node.id === selectId) || null;
  }, [familyData, selectId]);

  const closeModals = async () => {
    setIsRelationModalOpen(false);
    setIsEditModalOpen(false);
    setIsModalDeleteRelationOpen(false);
  };

  const handleEdit = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleRelationModal = useCallback(() => {
    setIsRelationModalOpen(true);
  }, []);

  const handleOpenDeleteModal = useCallback(() => {
    setIsModalDeleteRelationOpen(true);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Loading family tree...</p>
      </div>
    </div>
  );

  if (error) {
    if (error === 'Authentication required. Please login.') {
      return <NotAuthenticatedScreen />;
    }
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-gray-100 dark:border-gray-700">
          <div className="text-red-500 dark:text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!familyData) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center max-w-md w-full border border-gray-100 dark:border-gray-700">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No Family Data</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">We couldn't find any family data to display.</p>
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative bg-gray-50 dark:bg-gray-900 min-h-screen">
      <LeftHeader />

      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed left-20 bottom-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <div className="relative">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </button>

      {/* History Button */}
      {userRole !=='guest' && (<button
        onClick={() => setIsHistoryOpen(true)}
        className="fixed left-20 top-6 z-40 bg-green-600 hover:bg-gfreen-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
      >
        <div className="relative">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </button>)}

      <div className="flex flex-col h-[calc(100vh)]">
        <div className="flex-1 relative overflow-hidden">
          <SearchControlPanel
            familyData={familyData}
            filteredNodes={filteredNodes}
            recentRoots={recentRoots}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleRootChange={handleRootChange}
            goToPreviousRoot={goToPreviousRoot}
            previousRoot={previousRoot}
            displayOptions={displayOptions}
            setDisplayOptions={setDisplayOptions}
          />

          <PinchZoomPan
            min={0.5}
            max={2.5}
            captureWheel
            className="w-full h-full bg-white dark:bg-gray-800"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <ErrorBoundary>
                <ReactFamilyTree
                  nodes={familyData.nodes}
                  rootId={familyData.rootId}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  renderNode={(node: Readonly<ExtNode>) => (
                    <FamilyNode
                      key={node.id}
                      node={node}
                      isRoot={node.id === familyData.rootId}
                      isHover={node.id === hoverId}
                      onClick={setSelectId}
                      onSubClick={(id: string) => {
                        setFamilyData(prev => prev ? { ...prev, rootId: id } : prev);
                        localStorage.setItem('currentRootId', id);
                      }}
                      style={getNodeStyle(node)}
                      displayOptions={displayOptions}
                    />
                  )}
                />
              </ErrorBoundary>
            </div>
          </PinchZoomPan>

          {selectedNode && (
            <div className="absolute top-6 right-6 animate-fade-in">
              <NodeDetails
                node={selectedNode}
                onSelect={setSelectId}
                onHover={setHoverId}
                onClear={() => setHoverId(null)}
                onEdit={handleEdit}
                onRelationModal={handleRelationModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
                role={userRole}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-gray-800 shadow-2xl border-l border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-600 text-white">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-semibold">Family Chat</h3>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-indigo-700 rounded transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {replyingToMessage && (
            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-indigo-700 dark:text-indigo-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Odpowiadasz na wiadomość {replyingToMessage.user.name}</span>
                </div>
                <button
                  onClick={cancelReply}
                  className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 truncate">
                {replyingToMessage.message}
              </p>
            </div>
          )}

          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chatMessages.map((message) => (
                <ChatMessageItem
                  key={message._id}
                  message={message}
                  currentUser={currentUser}
                  sendingMessages={sendingMessages}
                  findReplyMessage={findReplyMessage}
                  startEditingMessage={startEditingMessage}
                  handleDeleteMessage={handleDeleteMessage}
                  startReplyingToMessage={startReplyingToMessage}
                  setReactingMessageId={setReactingMessageId}
                  handleAddReaction={handleAddReaction}
                  formatMessageTime={formatMessageTime}
                  editingMessageId={editingMessageId}
                  editMessageText={editMessageText}
                  setEditMessageText={setEditMessageText}
                  cancelEditing={cancelEditing}
                  saveEditedMessage={saveEditedMessage}
                  reactingMessageId={reactingMessageId}
                  COMMON_EMOJIS={COMMON_EMOJIS}
                />
              ))
            )}

            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-4 py-3 rounded-2xl rounded-bl-md max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm font-medium">
                      {typingUsers.map(user => user.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatMessagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex space-x-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={replyingToMessage ? `Odpowiedz na wiadomość ${replyingToMessage.user.name}...` : "Type a message..."}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <div className="absolute bottom-2 right-3 text-xs text-gray-400 dark:text-gray-500">
                  {newMessage.length}/500
                </div>
              </div>
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="px-4 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[44px] shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onUndo={handleUndoHistory}
        side="right"
        type="familyTree"
        id={id}
      />

      {isChatOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsChatOpen(false)}
        />
      )}

      {isEditModalOpen && selectedNode && (
        <EditModal
          id={selectedNode.id}
          onClose={closeModals}
          idTree={id}
        />
      )}

      {isRelationModalOpen && selectedNode && (
        <RelationModal
          isOpen={isRelationModalOpen}
          onClose={closeModals}
          personGender={selectedNode.gender}
          id={selectedNode.id}
          idTree={id}
          personName={`${selectedNode.firstName} ${selectedNode.lastName}`}
        />
      )}

      {isRelationDeleteModalOpen && selectedNode && (
        <Modal
          onClose={closeModals}
          isOpen={isRelationDeleteModalOpen}
          person={selectedNode}
          idTree={id}
        />
      )}
    </div>
  );
};

export default React.memo(FamilyViewWebsocket);