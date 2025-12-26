import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditLogService } from '../services/auditLogService';
import type { AuditLogResponse, AuditLogStats, AuditLog } from '../services/auditLogService';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';

const AuditLogPage: React.FC = () => {
    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

    const { data: stats, isLoading: statsLoading } = useQuery<AuditLogStats>({
        queryKey: ['audit-log-stats'],
        queryFn: () => auditLogService.getStats(30),
    });

    const { data: logs, isLoading: logsLoading, error: logsError } = useQuery<AuditLogResponse>({
        queryKey: ['audit-logs', page, actionFilter, entityFilter, dateRange],
        queryFn: () => auditLogService.getLogs({
            page,
            limit: 25,
            action: actionFilter || undefined,
            entityType: entityFilter || undefined,
            startDate: dateRange.start || undefined,
            endDate: dateRange.end || undefined,
        }),
    });

    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleExport = async (format: 'json' | 'csv') => {
        try {
            const blob = await auditLogService.exportLogs({
                action: actionFilter || undefined,
                entityType: entityFilter || undefined,
                startDate: dateRange.start || undefined,
                endDate: dateRange.end || undefined,
                format,
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'bg-red-100 text-red-700';
        if (action.includes('CREATE')) return 'bg-green-100 text-green-700';
        if (action.includes('UPDATE') || action.includes('CHANGE')) return 'bg-blue-100 text-blue-700';
        if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'bg-purple-100 text-purple-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getEntityIcon = (entityType: string) => {
        switch (entityType) {
            case 'USER': return '👤';
            case 'QUESTION': return '❓';
            case 'FLASHCARD': return '📚';
            case 'TEST': return '📝';
            case 'COMMENT': return '💬';
            case 'SYSTEM': return '⚙️';
            default: return '📄';
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">📋 Audit Logs</h1>
                        <p className="text-gray-600 mt-1">Track all administrative actions</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleExport('csv')}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Export CSV
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Export JSON
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                {stats && !statsLoading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="text-2xl font-bold text-indigo-600">{stats.totalLogs}</div>
                            <div className="text-sm text-gray-500">{stats.period}</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="text-2xl font-bold text-green-600">
                                {stats.byAction.find(a => a.action.includes('CREATE'))?.count || 0}
                            </div>
                            <div className="text-sm text-gray-500">Creates</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="text-2xl font-bold text-blue-600">
                                {stats.byAction.find(a => a.action.includes('UPDATE'))?.count || 0}
                            </div>
                            <div className="text-sm text-gray-500">Updates</div>
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="text-2xl font-bold text-red-600">
                                {stats.byAction.find(a => a.action.includes('DELETE'))?.count || 0}
                            </div>
                            <div className="text-sm text-gray-500">Deletes</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                            <select
                                value={actionFilter}
                                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Actions</option>
                                <option value="USER_CREATE">User Create</option>
                                <option value="USER_UPDATE">User Update</option>
                                <option value="USER_DELETE">User Delete</option>
                                <option value="USER_ROLE_CHANGE">Role Change</option>
                                <option value="QUESTION_CREATE">Question Create</option>
                                <option value="QUESTION_UPDATE">Question Update</option>
                                <option value="QUESTION_DELETE">Question Delete</option>
                                <option value="FLASHCARD_CREATE">Flashcard Create</option>
                                <option value="FLASHCARD_DELETE">Flashcard Delete</option>
                                <option value="TEST_CREATE">Test Create</option>
                                <option value="TEST_DELETE">Test Delete</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                            <select
                                value={entityFilter}
                                onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Entities</option>
                                <option value="USER">User</option>
                                <option value="QUESTION">Question</option>
                                <option value="FLASHCARD">Flashcard</option>
                                <option value="TEST">Test</option>
                                <option value="COMMENT">Comment</option>
                                <option value="SYSTEM">System</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setPage(1); }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setPage(1); }}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                    {(actionFilter || entityFilter || dateRange.start || dateRange.end) && (
                        <button
                            onClick={() => { setActionFilter(''); setEntityFilter(''); setDateRange({ start: '', end: '' }); setPage(1); }}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Logs Table */}
                {logsLoading ? (
                    <LoadingState message="Loading audit logs..." />
                ) : logsError || !logs ? (
                    <ErrorMessage title="Failed to load audit logs" message="Please try again." />
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Timestamp</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">User</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Action</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">Entity</th>
                                        <th className="text-left py-3 px-4 text-gray-600 font-medium">IP Address</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.logs.map((log: AuditLog) => (
                                        <tr key={log.id} className="border-t hover:bg-gray-50">
                                            <td className="py-3 px-4 font-mono text-xs">
                                                {formatDate(log.createdAt)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-gray-800">{log.userEmail || 'System'}</div>
                                                {log.userId && (
                                                    <div className="text-xs text-gray-400 font-mono truncate max-w-[150px]">
                                                        {log.userId}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span>{getEntityIcon(log.entityType)}</span>
                                                    <span className="text-gray-700">{log.entityType}</span>
                                                </div>
                                                {log.entityId && (
                                                    <div className="text-xs text-gray-400 font-mono truncate max-w-[150px]">
                                                        {log.entityId}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-xs text-gray-500">
                                                {log.ipAddress || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {logs.pagination && (
                            <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                                <span className="text-sm text-gray-600">
                                    Showing {((logs.pagination.page - 1) * logs.pagination.limit) + 1} to{' '}
                                    {Math.min(logs.pagination.page * logs.pagination.limit, logs.pagination.total)} of{' '}
                                    {logs.pagination.total} entries
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={page === 1}
                                        className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1 text-sm">
                                        Page {logs.pagination.page} of {logs.pagination.pages}
                                    </span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page >= logs.pagination.pages}
                                        className="px-3 py-1 border rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}

                        {logs.logs.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                No audit logs found matching your filters.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogPage;
