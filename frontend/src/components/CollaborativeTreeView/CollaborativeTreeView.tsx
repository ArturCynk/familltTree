import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LeftHeader from '../LeftHeader/LeftHeader';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faFolderOpen,
  faUsers,
  faCrown,
  faCalendar,
  faUser,
  faEdit,
  faTrash,
  faTimes,
  faSave,
  faUserPlus,
  faShieldAlt,
  faUserEdit,
  faEye,
  faSearch,
  faExclamationTriangle,
  faCheckCircle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

interface User {
  _id: string;
  email: string;
}

interface PopulatedOwner {
  _id: string;
  name: string;
  email: string;
}

interface Member {
  _id: string;
  user: User;
  role: 'admin' | 'editor' | 'guest';
  joinedAt: string;
}

interface FamilyTree {
  _id: string;
  name: string;
  createdAt: string;
  owner: PopulatedOwner;
  members: Member[];
}

const CollaborativeTreeView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'create' | 'open'>('create');
  const [memberTrees, setMemberTrees] = useState<FamilyTree[]>([]);
  const [ownedTrees, setOwnedTrees] = useState<FamilyTree[]>([]);
  const [treeName, setTreeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTab, setSelectedTab] = useState<'member' | 'owner'>('member');
  const [selectedTree, setSelectedTree] = useState<FamilyTree | null>(null);
  const [editName, setEditName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberRole, setMemberRole] = useState<'admin' | 'editor' | 'guest'>('editor');
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await axios.get('http://localhost:3001/api/auth/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setModalError('Error loading users list');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberResponse, ownedResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/family-trees/my-trees', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          }),
          axios.get('http://localhost:3001/api/family-trees/owned-trees', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
          })
        ]);
        setMemberTrees(memberResponse.data);
        setOwnedTrees(ownedResponse.data);
      } catch (error) {
        console.error('Error fetching trees:', error);
      }
    };

    if (activeSection === 'open') fetchData();
  }, [activeSection]);

  const handleCreateTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treeName.trim()) {
      setError('Tree name is required');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:3001/api/family-trees',
        { name: treeName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setSuccess('Tree created successfully!');
      setTreeName('');
      setTimeout(() => setSuccess(''), 3000);
      // Refresh the owned trees list
      const ownedResponse = await axios.get('http://localhost:3001/api/family-trees/owned-trees', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setOwnedTrees(ownedResponse.data);
      setActiveSection('open');
      setSelectedTab('owner');
    } catch (err) {
      setError('Error creating tree');
    } finally {
      setLoading(false);
    }
  };

  const handleTreeClick = (tree: FamilyTree) => {
    setSelectedTree(tree);
    setEditName(tree.name);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTree(null);
    setEditName('');
    setModalError('');
    setShowAddMember(false);
    setSelectedMember(null);
  };

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTree || !editName.trim()) return;

    try {
      setModalLoading(true);
      await axios.patch(
        `http://localhost:3001/api/family-trees/${selectedTree._id}`,
        { name: editName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const newOwnedTrees = ownedTrees.map(tree =>
        tree._id === selectedTree._id ? { ...tree, name: editName } : tree
      );
      setOwnedTrees(newOwnedTrees);
      closeModal();
    } catch (err) {
      setModalError('Error updating name');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTree) return;

    try {
      setModalLoading(true);
      await axios.delete(
        `http://localhost:3001/api/family-trees/${selectedTree._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setOwnedTrees(ownedTrees.filter(tree => tree._id !== selectedTree._id));
      closeModal();
    } catch (err) {
      setModalError('Error deleting tree');
    } finally {
      setModalLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !memberRole) {
      setModalError('Please fill all fields');
      return;
    }

    try {
      setModalLoading(true);
      const response = await axios.post(
        `http://localhost:3001/api/family-trees/${selectedTree?._id}/members`,
        { user: newMemberEmail, role: memberRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const updatedTree = { ...selectedTree!, members: [...selectedTree!.members, response.data] };
      setOwnedTrees(ownedTrees.map(tree => tree._id === selectedTree!._id ? updatedTree : tree));
      setSelectedTree(updatedTree);
      setNewMemberEmail('');
      setShowAddMember(false);
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error adding member');
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setModalLoading(true);
      await axios.delete(
        `http://localhost:3001/api/family-trees/${selectedTree?._id}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const updatedTree = { ...selectedTree!, members: selectedTree!.members.filter(m => m._id !== memberId) };
      setOwnedTrees(ownedTrees.map(tree => tree._id === selectedTree!._id ? updatedTree : tree));
      setSelectedTree(updatedTree);
    } catch (err) {
      setModalError('Error removing member');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateMemberRole = async () => {
    if (!selectedMember || !memberRole) return;

    try {
      setModalLoading(true);
      const response = await axios.patch(
        `http://localhost:3001/api/family-trees/${selectedTree?._id}/members/${selectedMember._id}`,
        { role: memberRole },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const updatedTree = {
        ...selectedTree!,
        members: selectedTree!.members.map(m => m._id === selectedMember._id ? response.data : m)
      };
      setOwnedTrees(ownedTrees.map(tree => tree._id === selectedTree!._id ? updatedTree : tree));
      setSelectedTree(updatedTree);
      setSelectedMember(null);
    } catch (err) {
      setModalError('Error updating role');
    } finally {
      setModalLoading(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: faCrown },
      editor: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: faEdit },
      guest: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: faEye }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.guest;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <FontAwesomeIcon icon={config.icon} className="mr-1 text-xs" />
        {role}
      </span>
    );
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: 'text-red-600 dark:text-red-400',
      editor: 'text-blue-600 dark:text-blue-400',
      guest: 'text-gray-600 dark:text-gray-400'
    };
    return colors[role as keyof typeof colors] || colors.guest;
  };

  // Filter trees based on search query
  const filteredMemberTrees = memberTrees.filter(tree =>
    tree.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tree.owner.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOwnedTrees = ownedTrees.filter(tree =>
    tree.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <LeftHeader />

      <div className="flex-1 p-4 sm:p-6 md:p-8 ml-0 md:ml-16">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400 mb-2">
            Collaborative Family Trees
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Create and manage family trees with your team
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Create Tree Card */}
          <div
            className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 group overflow-hidden ${
              activeSection === 'create'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl'
                : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl'
            }`}
            onClick={() => setActiveSection('create')}
          >
            <div className={`relative z-10 ${activeSection === 'create' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Create New Tree</h2>
                <div className={`p-3 rounded-xl ${
                  activeSection === 'create' ? 'bg-indigo-700' : 'bg-indigo-100 dark:bg-gray-600'
                }`}>
                  <FontAwesomeIcon 
                    icon={faPlus} 
                    className={`text-lg ${activeSection === 'create' ? 'text-white' : 'text-indigo-600 dark:text-white'}`}
                  />
                </div>
              </div>
              <p className="opacity-90 mb-4">Start a new genealogical journey with your family</p>
              <div className="flex items-center text-sm">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                <span>Invite family members to collaborate</span>
              </div>
            </div>
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              activeSection === 'create' ? 'opacity-10' : 'opacity-0'
            }`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>
          </div>

          {/* Open Tree Card */}
          <div
            className={`relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 group overflow-hidden ${
              activeSection === 'open'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-2xl'
                : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 shadow-lg hover:shadow-xl'
            }`}
            onClick={() => setActiveSection('open')}
          >
            <div className={`relative z-10 ${activeSection === 'open' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Open Existing</h2>
                <div className={`p-3 rounded-xl ${
                  activeSection === 'open' ? 'bg-indigo-700' : 'bg-indigo-100 dark:bg-gray-600'
                }`}>
                  <FontAwesomeIcon 
                    icon={faFolderOpen} 
                    className={`text-lg ${activeSection === 'open' ? 'text-white' : 'text-indigo-600 dark:text-white'}`}
                  />
                </div>
              </div>
              <p className="opacity-90 mb-4">Continue collaborating on existing family trees</p>
              <div className="flex items-center text-sm">
                <FontAwesomeIcon icon={faCrown} className="mr-2" />
                <span>Manage your trees and members</span>
              </div>
            </div>
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              activeSection === 'open' ? 'opacity-10' : 'opacity-0'
            }`}>
              <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/10 rounded-full"></div>
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {activeSection === 'create' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faPlus} className="text-indigo-600 dark:text-indigo-400 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Create New Family Tree
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Give your family tree a meaningful name to get started
                </p>
              </div>

              <form onSubmit={handleCreateTree} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Tree Name
                  </label>
                  <input
                    type="text"
                    value={treeName}
                    onChange={(e) => setTreeName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-base transition-all duration-200"
                    placeholder="e.g. Smith Family Tree, Johnson Ancestry..."
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3 animate-in fade-in-0">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-lg mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-800 dark:text-red-300 font-medium">Error</p>
                      <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start space-x-3 animate-in fade-in-0">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-800 dark:text-green-300 font-medium">Success!</p>
                      <p className="text-green-700 dark:text-green-400 text-sm">{success}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !treeName.trim()}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                    loading || !treeName.trim()
                      ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-gray-500 dark:text-gray-400'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                      <span>Creating Tree...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlus} />
                      <span>Create Family Tree</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {activeSection === 'open' && (
          <div className="space-y-6">
            {/* Search and Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Search trees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  />
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                  <button
                    onClick={() => setSelectedTab('member')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      selectedTab === 'member'
                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Your Projects ({memberTrees.length})</span>
                  </button>
                  <button
                    onClick={() => setSelectedTab('owner')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      selectedTab === 'owner'
                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    <FontAwesomeIcon icon={faCrown} />
                    <span>Owned Trees ({ownedTrees.length})</span>
                  </button>
                </div>
              </div>

              {/* Trees Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(selectedTab === 'member' ? filteredMemberTrees : filteredOwnedTrees).map((tree) => (
                  <div
                    key={tree._id}
                    className={`bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-600 group ${
                      selectedTab === 'owner' ? 'hover:border-indigo-300 dark:hover:border-indigo-600' : ''
                    }`}
                    onClick={() => selectedTab === 'owner' ? handleTreeClick(tree) : navigate(`/tree/${tree._id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tree.name}
                      </h4>
                      {selectedTab === 'owner' && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                          <FontAwesomeIcon icon={faCrown} className="mr-1 text-xs" />
                          Owner
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-xs" />
                        <span className="truncate">By: {tree.owner.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FontAwesomeIcon icon={faCalendar} className="mr-2 text-xs" />
                        <span>Created: {new Date(tree.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-xs" />
                        <span>Members: </span>
                      </div>
                    </div>

                    {selectedTab === 'owner' && (
                      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <button className="w-full py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors">
                          Manage Tree
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {(selectedTab === 'member' && filteredMemberTrees.length === 0) ||
              (selectedTab === 'owner' && filteredOwnedTrees.length === 0) ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon 
                      icon={selectedTab === 'member' ? faUsers : faCrown} 
                      className="text-gray-400 dark:text-gray-500 text-3xl" 
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    {searchQuery ? 'No trees found' : 
                     selectedTab === 'member' 
                       ? "You're not a member of any trees" 
                       : "You don't own any trees yet"}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : selectedTab === 'member'
                        ? 'Get invited to a tree or create your own'
                        : 'Create your first family tree to get started'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setActiveSection('create')}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
                    >
                      Create New Tree
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Tree Management Modal */}
        {isModalOpen && selectedTree && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                    <FontAwesomeIcon icon={faCrown} className="text-indigo-600 dark:text-indigo-400 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Manage Tree</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedTree._id}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <FontAwesomeIcon icon={faTimes} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Tree Name Form */}
                <form onSubmit={handleRename}>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Tree Name
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                      disabled={modalLoading}
                    />
                    <button
                      type="submit"
                      disabled={modalLoading || editName === selectedTree.name}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faSave} />
                      <span>Save</span>
                    </button>
                  </div>
                </form>

                {/* Members Management */}
                <div className="border-t pt-6 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center space-x-2">
                      <FontAwesomeIcon icon={faUsers} className="text-indigo-500" />
                      <span>Tree Members ({selectedTree.members.length + 1})</span>
                    </h4>
                    <button
                      onClick={() => {
                        setShowAddMember(true);
                        fetchUsers();
                      }}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                    >
                      <FontAwesomeIcon icon={faUserPlus} />
                      <span>Add Member</span>
                    </button>
                  </div>

                  {/* Owner */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800/30 rounded-xl flex items-center justify-center">
                          <FontAwesomeIcon icon={faCrown} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{selectedTree.owner.email}</p>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300">
                            Owner
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Members List */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedTree.members.map(member => (
                      <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                            <FontAwesomeIcon 
                              icon={faUser} 
                              className={getRoleColor(member.role)} 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 dark:text-white truncate">
                              {member.user.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              {getRoleBadge(member.role)}
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Joined {new Date(member.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setMemberRole(member.role);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                            title="Edit role"
                          >
                            <FontAwesomeIcon icon={faUserEdit} className="text-blue-600 dark:text-blue-400 text-sm" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Remove member"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-red-600 dark:text-red-400 text-sm" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Member Form */}
                  {showAddMember && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mt-4 animate-in fade-in-0">
                      <h5 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
                        <FontAwesomeIcon icon={faUserPlus} className="text-green-500" />
                        <span>Add New Member</span>
                      </h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select User
                          </label>
                          {usersLoading ? (
                            <div className="text-center py-4">
                              <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-400 text-xl" />
                            </div>
                          ) : (
                            <select
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                            >
                              <option value="">Select a user...</option>
                              {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                  {user.email}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Select Role
                          </label>
                          <select
                            value={memberRole}
                            onChange={(e) => setMemberRole(e.target.value as typeof memberRole)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                          >
                            <option value="admin">Administrator</option>
                            <option value="editor">Editor</option>
                            <option value="guest">Guest (View Only)</option>
                          </select>
                        </div>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleAddMember}
                            disabled={modalLoading || !newMemberEmail}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                          >
                            <FontAwesomeIcon icon={faUserPlus} />
                            <span>Add Member</span>
                          </button>
                          <button
                            onClick={() => setShowAddMember(false)}
                            className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-xl font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Edit Member Role */}
                  {selectedMember && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-4 animate-in fade-in-0">
                      <h5 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
                        <FontAwesomeIcon icon={faUserEdit} className="text-blue-500" />
                        <span>Edit Role for {selectedMember.user.email}</span>
                      </h5>
                      <div className="space-y-3">
                        <select
                          value={memberRole}
                          onChange={(e) => setMemberRole(e.target.value as typeof memberRole)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          <option value="admin">Administrator</option>
                          <option value="editor">Editor</option>
                          <option value="guest">Guest (View Only)</option>
                        </select>
                        <div className="flex space-x-3">
                          <button
                            onClick={handleUpdateMemberRole}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                          >
                            <FontAwesomeIcon icon={faSave} />
                            <span>Save Changes</span>
                          </button>
                          <button
                            onClick={() => setSelectedMember(null)}
                            className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-xl font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {modalError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-lg mt-0.5 flex-shrink-0" />
                    <p className="text-red-800 dark:text-red-300 text-sm">{modalError}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl font-medium transition-colors flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  <span>Delete Tree</span>
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => navigate(`/tree/${selectedTree._id}`)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    <span>View Tree</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md animate-in zoom-in-95">
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Delete Tree?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete the tree "<span className="font-semibold">{selectedTree?.name}</span>"? 
                  This action cannot be undone and all data will be permanently lost.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={modalLoading}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:dark:bg-gray-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {modalLoading ? (
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                    ) : (
                      <FontAwesomeIcon icon={faTrash} />
                    )}
                    <span>{modalLoading ? 'Deleting...' : 'Delete Tree'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeTreeView;