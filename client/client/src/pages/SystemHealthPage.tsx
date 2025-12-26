import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemHealthService } from '../services/systemHealthService';
import type { SystemHealthResponse, DatabaseMetrics } from '../services/systemHealthService';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import LoadingState from '../components/ui/LoadingState';
import ErrorMessage from '../components/ui/ErrorMessage';

const SystemHealthPage: React.FC = () => {
    const { user } = useAuth();

    const { data: health, isLoading: healthLoading, error: healthError, refetch } = useQuery<SystemHealthResponse>({
        queryKey: ['system-health'],
        queryFn: systemHealthService.getDetailedHealth,
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const { data: dbMetrics, isLoading: dbLoading } = useQuery<DatabaseMetrics>({
        queryKey: ['database-metrics'],
        queryFn: systemHealthService.getDatabaseMetrics,
        refetchInterval: 60000, // Refresh every minute
    });

    if (user?.role !== 'ADMIN') {
        return <Navigate to="/dashboard" replace />;
    }

    if (healthLoading) return <LoadingState message="Loading system health..." />;
    if (healthError || !health) return <ErrorMessage title="Failed to load system health" message="Please try again." />;

    const formatBytes = (bytes: number) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return `${gb.toFixed(2)} GB`;
    };

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${days}d ${hours}h ${minutes}m`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OK':
            case 'healthy':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'DEGRADED':
            case 'degraded':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'DOWN':
            case 'unhealthy':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OK':
            case 'healthy':
                return '✓';
            case 'DEGRADED':
            case 'degraded':
                return '⚠';
            case 'DOWN':
            case 'unhealthy':
                return '✕';
            default:
                return '?';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">🔧 System Health</h1>
                        <p className="text-gray-600 mt-1">Real-time monitoring and metrics</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Refresh
                    </button>
                </div>

                {/* Overall Status */}
                <div className={`p-6 rounded-lg border-2 mb-6 ${getStatusColor(health.status)}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-4xl mr-4">{getStatusIcon(health.status)}</span>
                            <div>
                                <h2 className="text-2xl font-bold">System Status: {health.status}</h2>
                                <p className="text-sm opacity-75">
                                    Environment: {health.environment} | Version: {health.version}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm">Last updated</p>
                            <p className="font-mono">{new Date(health.timestamp).toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>

                {/* Services Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Database Status */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">🗄️ Database</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.services.database.status)}`}>
                                {health.services.database.status}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Latency</span>
                                <span className="font-mono">{health.services.database.latencyMs}ms</span>
                            </div>
                            {health.services.database.message && (
                                <p className="text-gray-500">{health.services.database.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Redis Status */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">⚡ Redis Cache</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.services.redis.status)}`}>
                                {health.services.redis.status}
                            </span>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Latency</span>
                                <span className="font-mono">{health.services.redis.latencyMs}ms</span>
                            </div>
                            {health.services.redis.message && (
                                <p className="text-gray-500">{health.services.redis.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Metrics */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* CPU */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">💻 CPU Usage</h3>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600">
                                {Math.round(health.system.cpuUsage * 100)}%
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${
                                        health.system.cpuUsage > 0.8 ? 'bg-red-500' :
                                        health.system.cpuUsage > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${health.system.cpuUsage * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Memory */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Memory Usage</h3>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-indigo-600">
                                {health.system.memoryUsage.percentage}%
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatBytes(health.system.memoryUsage.used)} / {formatBytes(health.system.memoryUsage.total)}
                            </p>
                            <div className="mt-2 bg-gray-200 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full ${
                                        health.system.memoryUsage.percentage > 80 ? 'bg-red-500' :
                                        health.system.memoryUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${health.system.memoryUsage.percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Uptime */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">⏱️ Uptime</h3>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-indigo-600">
                                {formatUptime(health.uptime)}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Load Avg: {health.system.loadAverage.map(l => l.toFixed(2)).join(', ')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Application Metrics */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Application Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{health.metrics.totalUsers}</div>
                            <div className="text-sm text-gray-600">Total Users</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{health.metrics.activeUsers}</div>
                            <div className="text-sm text-gray-600">Active Today</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{health.metrics.activeSessions}</div>
                            <div className="text-sm text-gray-600">Active Sessions</div>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-lg">
                            <div className="text-2xl font-bold text-amber-600">{health.metrics.avgApiResponseTime}ms</div>
                            <div className="text-sm text-gray-600">Avg Response</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{health.metrics.recentErrors}</div>
                            <div className="text-sm text-gray-600">Recent Errors</div>
                        </div>
                    </div>
                </div>

                {/* Database Metrics */}
                {dbMetrics && !dbLoading && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🗃️ Database Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {Object.entries(dbMetrics.tableCounts).map(([table, { count }]) => (
                                <div key={table} className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="text-xl font-bold text-gray-800">{count.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 capitalize">{table.replace('_', ' ')}</div>
                                </div>
                            ))}
                        </div>
                        {dbMetrics.recentSessionStats.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Test Sessions (7 days)</h4>
                                <div className="flex gap-4">
                                    {dbMetrics.recentSessionStats.map((stat) => (
                                        <div key={stat.status} className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${
                                                stat.status === 'COMPLETED' ? 'bg-green-500' :
                                                stat.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-500'
                                            }`} />
                                            <span className="text-sm text-gray-600">{stat.status}: {stat._count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemHealthPage;
