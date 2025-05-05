import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LeftHeader from '../LeftHeader/LeftHeader';
import { useNavigate } from 'react-router-dom';

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

    const isOwner = true;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            <LeftHeader />

            <div className="flex-1 p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                    Collaborative Family Tree
                </h1>

                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    {/* Create Tree Card */}
                    <div className={`flex-1 p-6 rounded-xl cursor-pointer transition-all ${activeSection === 'create'
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl'
                            : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'}`}
                        onClick={() => setActiveSection('create')}>
                        <div className={`text-center ${activeSection === 'create' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                            <h2 className="text-xl font-bold mb-3">Create New Tree</h2>
                            <p className="text-sm opacity-90">Start new genealogical journey</p>
                            <div className="mt-4 flex justify-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeSection === 'create' ? 'bg-indigo-700' : 'bg-indigo-100 dark:bg-gray-600'}`}>
                                    <svg className={`w-6 h-6 ${activeSection === 'create' ? 'text-white' : 'text-indigo-600 dark:text-white'}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Open Tree Card */}
                    <div className={`flex-1 p-6 rounded-xl cursor-pointer transition-all ${activeSection === 'open'
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl'
                            : 'bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg'}`}
                        onClick={() => setActiveSection('open')}>
                        <div className={`text-center ${activeSection === 'open' ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                            <h2 className="text-xl font-bold mb-3">Open Existing</h2>
                            <p className="text-sm opacity-90">Continue collaborating on existing trees</p>
                            <div className="mt-4 flex justify-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activeSection === 'open' ? 'bg-indigo-700' : 'bg-indigo-100 dark:bg-gray-600'}`}>
                                    <svg className={`w-6 h-6 ${activeSection === 'open' ? 'text-white' : 'text-indigo-600 dark:text-white'}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeSection === 'create' && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
                            Create New Family Tree
                        </h3>
                        <form onSubmit={handleCreateTree} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tree Name
                                </label>
                                <input
                                    type="text"
                                    id="treeName"
                                    value={treeName}
                                    onChange={(e) => setTreeName(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="e.g. Smith Family Tree"
                                    disabled={loading}
                                />
                            </div>
                            {error && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {success}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 px-4 rounded-lg transition-colors ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                                {loading ? 'Creating...' : 'Create Tree'}
                            </button>
                        </form>
                    </div>
                )}

                {activeSection === 'open' && (
                    <div>
                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => setSelectedTab('member')}
                                className={`px-6 py-2 rounded-full ${selectedTab === 'member'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                Your Projects
                            </button>
                            <button
                                onClick={() => setSelectedTab('owner')}
                                className={`px-6 py-2 rounded-full ${selectedTab === 'owner'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                Owned Trees
                            </button>
                        </div>

                        {selectedTab === 'member' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {memberTrees.map((tree) => (
                                    <div key={tree._id}
                                    onClick={() => navigate(`/tree/${tree._id}`)} 
                                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{tree.name}</h4>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span>Owner: {tree.owner.email}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ownedTrees.map((tree) => (
                                    <div
                                        key={tree._id}
                                        onClick={() => handleTreeClick(tree)}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 relative cursor-pointer hover:shadow-lg transition-shadow">
                                        <div className="absolute top-2 right-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200 px-2 py-1 rounded-full text-xs">
                                            Owner
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{tree.name}</h4>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Created: {new Date(tree.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(selectedTab === 'member' && memberTrees.length === 0) ||
                            (selectedTab === 'owner' && ownedTrees.length === 0) ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 dark:text-gray-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {selectedTab === 'member'
                                        ? "You're not a member of any trees"
                                        : "You don't own any trees yet"}
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Tree Management Modal */}
                {isModalOpen && selectedTree && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg relative">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Manage Tree
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">ID: {selectedTree._id}</p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleRename} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Tree Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 dark:bg-gray-900 dark:text-white"
                                        disabled={modalLoading}
                                    />
                                </div>

                                {/* Members Management Section */}
                                <div className="border-t pt-6 dark:border-gray-700">
                                    <h4 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                                        Tree Members
                                    </h4>

                                    <div className="space-y-3 mb-4">
                                        {selectedTree.members.map(member => (
                                            <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div>
                                                    <span className="text-gray-800 dark:text-white">{member.user.email}</span>
                                                    <span className="text-sm ml-2 px-2 py-1 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200">
                                                        {member.role}
                                                    </span>
                                                </div>
                                                {isOwner && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedMember(member);
                                                                setMemberRole(member.role);
                                                            }}
                                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm">
                                                            Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveMember(member._id)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm">
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {isOwner && (
                                        <>
                                            {showAddMember ? (
                                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                                    <div className="mb-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Select User
                                                        </label>
                                                        {usersLoading ? (
                                                            <div className="text-center py-2">Loading users...</div>
                                                        ) : (
                                                            <select
                                                                value={newMemberEmail}
                                                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                            >
                                                                <option value="">Select a user</option>
                                                                {users.map((user) => (
                                                                    <option key={user._id} value={user._id}>
                                                                        {user.email}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>

                                                    <div className="mb-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Select Role
                                                        </label>
                                                        <select
                                                            value={memberRole}
                                                            onChange={(e) => setMemberRole(e.target.value as typeof memberRole)}
                                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                        >
                                                            <option value="admin">Administrator</option>
                                                            <option value="editor">Editor</option>
                                                            <option value="guest">Guest</option>
                                                        </select>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleAddMember}
                                                            disabled={modalLoading || usersLoading}
                                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                                        >
                                                            Add Member
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAddMember(false)}
                                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowAddMember(true);
                                                        fetchUsers();
                                                    }}
                                                    className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                                >
                                                    + Add New Member
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {selectedMember && (
                                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            <h5 className="text-gray-800 dark:text-white mb-2">
                                                Edit role for {selectedMember.user.email}
                                            </h5>
                                            <select
                                                value={memberRole}
                                                onChange={(e) => setMemberRole(e.target.value as typeof memberRole)}
                                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                            >
                                                <option value="admin">Administrator</option>
                                                <option value="editor">Editor</option>
                                                <option value="guest">Guest</option>
                                            </select>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={handleUpdateMemberRole}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedMember(null)}
                                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 justify-end border-t pt-6 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                        disabled={modalLoading}>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="px-5 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Tree
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2"
                                        disabled={modalLoading}>
                                        {modalLoading ? (
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative">
                            <div className="text-center">
                                <div className="mx-auto mb-4 text-red-500">
                                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                    Confirm Deletion
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    Are you sure you want to permanently delete the tree "{selectedTree?.name}"? This action cannot be undone.
                                </p>
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="px-5 py-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
                                        disabled={modalLoading}>
                                        {modalLoading ? 'Deleting...' : 'Delete Tree'}
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