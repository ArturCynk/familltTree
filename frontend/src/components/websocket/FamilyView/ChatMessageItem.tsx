import React, { useRef, useEffect } from 'react';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Reaction {
  emoji: string;
  user: User;
  createdAt: string;
}

export interface EditHistory {
  previousMessage: string;
  editedAt: string;
}

export interface ChatMessage {
  _id: string;
  familyTree: string;
  user: User;
  message: string;
  type: 'text' | 'system' | 'notification';
  replyTo?: string;
  readBy: string[];
  reactions: Reaction[];
  edited: boolean;
  editHistory: EditHistory[];
  deleted: boolean;
  deletedAt?: string;
  deletedBy?: User;
  createdAt: string;
  updatedAt?: string;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  currentUser: { id: string; name: string; email: string } | null;
  sendingMessages: Set<string>;
  findReplyMessage: (messageId: string) => ChatMessage | null;
  startEditingMessage: (message: ChatMessage) => void;
  handleDeleteMessage: (messageId: string) => void;
  startReplyingToMessage: (message: ChatMessage) => void;
  setReactingMessageId: (messageId: string | null) => void;
  handleAddReaction: (messageId: string, emoji: string) => void;
  formatMessageTime: (timestamp: string) => string;
  editingMessageId: string | null;
  editMessageText: string;
  setEditMessageText: (text: string) => void;
  cancelEditing: () => void;
  saveEditedMessage: () => void;
  reactingMessageId: string | null;
  COMMON_EMOJIS: string[];
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo(({
  message,
  currentUser,
  sendingMessages,
  findReplyMessage,
  startEditingMessage,
  handleDeleteMessage,
  startReplyingToMessage,
  setReactingMessageId,
  handleAddReaction,
  formatMessageTime,
  editingMessageId,
  editMessageText,
  setEditMessageText,
  cancelEditing,
  saveEditedMessage,
  reactingMessageId,
  COMMON_EMOJIS
}) => {
  const reactionPickerRef = useRef<HTMLDivElement>(null);
  const isOwnMessage = message.user._id === currentUser?.id;
  const replyMessage = message.replyTo ? findReplyMessage(message.replyTo) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setReactingMessageId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setReactingMessageId]);

  if (message.deleted) {
    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 italic text-sm">
          <p>Wiadomość została usunięta</p>
          <div className="text-xs mt-1">
            {formatMessageTime(message.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl transition-all duration-200 relative group ${
          isOwnMessage
            ? 'bg-indigo-500 text-white rounded-br-md shadow-md'
            : message.type === 'system'
            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-center mx-auto max-w-md'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm'
        } ${sendingMessages.has(message._id) ? 'opacity-60' : ''}`}
      >
        {isOwnMessage && !message.deleted && (
          <div className="absolute -top-8 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <button
              onClick={() => startEditingMessage(message)}
              className="p-1 bg-white dark:bg-gray-800 rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Edytuj wiadomość"
            >
              <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteMessage(message._id)}
              className="p-1 bg-white dark:bg-gray-800 rounded shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Usuń wiadomość"
            >
              <svg className="w-3 h-3 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}

        {!isOwnMessage && !message.deleted && (
          <div className="absolute -top-8 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
            <button
              onClick={() => startReplyingToMessage(message)}
              className="p-1 bg-white dark:bg-gray-800 rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Odpowiedz"
            >
              <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={() => setReactingMessageId(message._id)}
              className="p-1 bg-white dark:bg-gray-800 rounded shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Dodaj reakcję"
            >
              <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        )}

        {message.type !== 'system' && message.user && !isOwnMessage && (
          <div className="flex items-center space-x-2 mb-2">
            {message.user.avatar ? (
              <img
                src={message.user.avatar}
                alt={message.user.name}
                className="w-5 h-5 rounded-full"
              />
            ) : (
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-medium">
                  {message.user.email.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {message.user.name}
            </span>
          </div>
        )}

        {replyMessage && !replyMessage.deleted && (
          <div className="mb-2 p-2 bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 rounded-lg border-l-2 border-indigo-400">
            <div className="flex items-center space-x-2 text-xs opacity-75">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="font-medium">{replyMessage.user.name}</span>
            </div>
            <p className="text-xs mt-1 truncate">{replyMessage.message}</p>
          </div>
        )}

        <div className="break-words">
          {editingMessageId === message._id ? (
            <div className="space-y-2">
              <textarea
                value={editMessageText}
                onChange={(e) => setEditMessageText(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white dark:bg-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                autoFocus
              />
              <div className="flex space-x-2 justify-end">
                <button
                  onClick={cancelEditing}
                  className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Anuluj
                </button>
                <button
                  onClick={saveEditedMessage}
                  disabled={!editMessageText.trim() || editMessageText === message.message}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Zapisz
                </button>
              </div>
            </div>
          ) : (
            <p className={`text-sm leading-relaxed ${
              message.type === 'system' ? 'font-medium' : ''
            }`}>
              {message.message}
            </p>
          )}
        </div>

        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
              const reactionsForEmoji = message.reactions.filter(r => r.emoji === emoji);
              const hasUserReacted = reactionsForEmoji.some(r => r.user._id === currentUser?.id);
              
              return (
                <button
                  key={emoji}
                  onClick={() => handleAddReaction(message._id, emoji)}
                  className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                    hasUserReacted
                      ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                      : 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  <span className="mr-1">{emoji}</span>
                  <span>{reactionsForEmoji.length}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className={`text-xs mt-2 flex items-center ${
          isOwnMessage 
            ? 'text-indigo-200 justify-end' 
            : message.type === 'system'
            ? 'text-amber-600 dark:text-amber-400 justify-center'
            : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>
            {formatMessageTime(message.createdAt)}
            {message.edited && !editingMessageId && (
              <span className="ml-1 italic">(edytowana)</span>
            )}
          </span>
          {sendingMessages.has(message._id) && (
            <span className="ml-2 italic flex items-center">
              <svg className="w-3 h-3 mr-1 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
              </svg>
              Wysyłanie...
            </span>
          )}
          {isOwnMessage && !message.deleted && (
            <span className="ml-2">
              {message.readBy.length > 1 ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>

      {reactingMessageId === message._id && (
        <div
          ref={reactionPickerRef}
          className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-2"
          style={{
            transform: 'translateY(-100%)'
          }}
        >
          <div className="grid grid-cols-5 gap-1">
            {COMMON_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleAddReaction(message._id, emoji)}
                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

export default ChatMessageItem;