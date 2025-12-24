import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type { DashboardStats, AdminUser, AdminQuestion, AdminTest } from '../services/adminService';
import { questionService } from '../services/questionService';
import { useAuth } from '../contexts/AuthContext';
import type { Domain } from '../types';
import { Navigate } from 'react-router-dom';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';

type TabType = 'dashboard' | 'users' | 'questions' | 'tests';

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('');

    // Redirect non-admins
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">⚙️ Admin Panel</h1>
                    <p className="text-gray-600 mt-1">Manage users, questions, and content</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                    <div className="flex border-b">
                        {(['dashboard', 'users', 'questions', 'tests'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
                                className={`flex-1 py-3 px-4 text-sm font-medium capitalize ${activeTab === tab
                                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {tab === 'dashboard' && '📊 '}
                                {tab === 'users' && '👥 '}
                                {tab === 'questions' && '❓ '}
                                {tab === 'tests' && '📝 '}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'dashboard' && <DashboardTab />}
                {activeTab === 'users' && <UsersTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
                {activeTab === 'questions' && <QuestionsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain} />}
                {activeTab === 'tests' && <TestsTab />}
            </div>
        </div>
    );
};

// Dashboard Tab
const DashboardTab: React.FC = () => {
    const { data, isLoading, error } = useQuery<DashboardStats>({
        queryKey: ['admin-dashboard'],
        queryFn: adminService.getDashboard,
    });

    if (isLoading) return <LoadingState message="Loading dashboard..." />;
    if (error || !data) return <ErrorMessage title="Failed to load dashboard" message="Please try again." />;

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Users" value={data.overview.totalUsers} icon="👥" color="blue" />
                <StatCard title="Questions" value={data.overview.totalQuestions} icon="❓" color="green" />
                <StatCard title="Flashcards" value={data.overview.totalFlashcards} icon="📚" color="purple" />
                <StatCard title="Tests Taken" value={data.overview.totalSessions} icon="📝" color="amber" />
            </div>

            {/* Performance Stats */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Questions by Domain</h3>
                    <div className="space-y-3">
                        {data.domainStats.map((domain) => (
                            <div key={domain.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: domain.color }}></span>
                                    <span className="text-gray-700">{domain.name}</span>
                                </div>
                                <span className="font-semibold text-gray-900">{domain.questionCount}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Recent Users</h3>
                    <div className="space-y-3">
                        {data.recentUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-800">{user.firstName} {user.lastName}</div>
                                    <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {user.role}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Test Sessions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 text-gray-600">User</th>
                                <th className="text-left py-2 text-gray-600">Test</th>
                                <th className="text-left py-2 text-gray-600">Status</th>
                                <th className="text-left py-2 text-gray-600">Score</th>
                                <th className="text-left py-2 text-gray-600">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentSessions.map((session) => (
                                <tr key={session.id} className="border-b last:border-0">
                                    <td className="py-2">{session.user.firstName} {session.user.lastName}</td>
                                    <td className="py-2">{session.test.name}</td>
                                    <td className="py-2">
                                        <span className={`px-2 py-1 text-xs rounded-full ${session.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="py-2">{session.score !== null ? `${session.score}%` : '-'}</td>
                                    <td className="py-2 text-gray-500">{new Date(session.startedAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Users Tab
const UsersTab: React.FC<{ searchTerm: string; setSearchTerm: (s: string) => void }> = ({ searchTerm, setSearchTerm }) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-users', page, searchTerm],
        queryFn: () => adminService.getUsers({ page, limit: 15, search: searchTerm }),
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string; role: string }) =>
            adminService.updateUserRole(userId, role),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
    });

    if (isLoading) return <LoadingState message="Loading users..." />;

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Search */}
            <div className="p-4 border-b">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left py-3 px-4 text-gray-600">User</th>
                            <th className="text-left py-3 px-4 text-gray-600">Email</th>
                            <th className="text-left py-3 px-4 text-gray-600">Role</th>
                            <th className="text-left py-3 px-4 text-gray-600">Sessions</th>
                            <th className="text-left py-3 px-4 text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.users.map((user: AdminUser) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{user.firstName} {user.lastName}</td>
                                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                <td className="py-3 px-4">
                                    <select
                                        value={user.role}
                                        onChange={(e) => updateRoleMutation.mutate({ userId: user.id, role: e.target.value })}
                                        className="px-2 py-1 border rounded text-sm"
                                    >
                                        <option value="USER">User</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </td>
                                <td className="py-3 px-4">{user._count.testSessions}</td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this user?')) deleteMutation.mutate(user.id);
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {data?.pagination && (
                <div className="p-4 border-t flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                        Page {data.pagination.page} of {data.pagination.pages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= data.pagination.pages}
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Questions Tab
const QuestionsTab: React.FC<{
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    selectedDomain: string;
    setSelectedDomain: (s: string) => void;
}> = ({ searchTerm, setSearchTerm, selectedDomain, setSelectedDomain }) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);

    const { data: domains } = useQuery({
        queryKey: ['domains'],
        queryFn: questionService.getDomains,
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-questions', page, searchTerm, selectedDomain],
        queryFn: () => adminService.getQuestions({ page, limit: 10, search: searchTerm, domain: selectedDomain }),
    });

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteQuestion,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-questions'] }),
    });

    if (isLoading) return <LoadingState message="Loading questions..." />;

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            {/* Filters */}
            <div className="p-4 border-b flex gap-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
                <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="">All Domains</option>
                    {domains?.map((d: Domain) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            {/* Questions List */}
            <div className="divide-y">
                {data?.questions.map((q: AdminQuestion) => (
                    <div key={q.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className="px-2 py-1 text-xs rounded-full"
                                        style={{ backgroundColor: `${q.domain.color}20`, color: q.domain.color }}
                                    >
                                        {q.domain.name}
                                    </span>
                                    <span className="px-2 py-1 text-xs bg-gray-100 rounded-full">{q.difficulty}</span>
                                </div>
                                <p className="text-gray-800 line-clamp-2">{q.questionText}</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Delete this question?')) deleteMutation.mutate(q.id);
                                }}
                                className="ml-4 text-red-600 hover:text-red-800 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {data?.pagination && (
                <div className="p-4 border-t flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                        {data.pagination.total} questions total
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page >= data.pagination.pages}
                            className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Tests Tab
const TestsTab: React.FC = () => {
    const queryClient = useQueryClient();

    const { data: tests, isLoading } = useQuery<AdminTest[]>({
        queryKey: ['admin-tests'],
        queryFn: adminService.getTests,
    });

    const toggleActiveMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            adminService.updateTest(id, { isActive }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tests'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: adminService.deleteTest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tests'] }),
    });

    if (isLoading) return <LoadingState message="Loading tests..." />;

    return (
        <div className="bg-white rounded-lg shadow-sm border">
            <div className="divide-y">
                {tests?.map((test) => (
                    <div key={test.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-medium text-gray-900">{test.name}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${test.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {test.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{test.description}</p>
                                <div className="flex gap-4 text-sm text-gray-500 mt-2">
                                    <span>📝 {test._count.testQuestions} questions</span>
                                    <span>⏱️ {test.timeLimitMinutes} min</span>
                                    <span>👥 {test._count.sessions} sessions</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => toggleActiveMutation.mutate({ id: test.id, isActive: !test.isActive })}
                                    className={`px-3 py-1 text-sm rounded ${test.isActive ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'}`}
                                >
                                    {test.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete this test?')) deleteMutation.mutate(test.id);
                                    }}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-200 text-blue-600',
        green: 'bg-green-50 border-green-200 text-green-600',
        purple: 'bg-purple-50 border-purple-200 text-purple-600',
        amber: 'bg-amber-50 border-amber-200 text-amber-600',
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-3xl font-bold">{value.toLocaleString()}</div>
            <div className="text-sm opacity-80">{title}</div>
        </div>
    );
};

export default AdminPage;
