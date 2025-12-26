import { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Award } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    userId: string;
    firstName: string;
    lastName: string;
    score: number;
    testsTaken: number;
    averageAccuracy: number;
    streak: number;
}

type TimePeriod = 'weekly' | 'monthly' | 'all_time';

export function LeaderboardPage() {
    const [period, setPeriod] = useState<TimePeriod>('all_time');
    const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRank, setUserRank] = useState<number | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [period]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/leaderboard/global?period=${period}`);
            const data = await response.json();
            setGlobalLeaderboard(data);

            // Fetch user rank
            const token = localStorage.getItem('token');
            if (token) {
                const rankResponse = await fetch('/api/leaderboard/rank', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (rankResponse.ok) {
                    const rankData = await rankResponse.json();
                    setUserRank(rankData.global?.rank || null);
                }
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
        return <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{rank}</span>;
    };

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
        if (rank === 2) return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
        if (rank === 3) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
        return '';
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Leaderboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    See how you rank among other learners
                </p>
            </div>

            {/* Period Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                <div className="flex gap-2">
                    {(['weekly', 'monthly', 'all_time'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`
                                px-4 py-2 rounded-lg font-medium transition-colors
                                ${period === p
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}
                            `}
                        >
                            {p === 'weekly' ? 'Weekly' : p === 'monthly' ? 'Monthly' : 'All Time'}
                        </button>
                    ))}
                </div>
            </div>

            {/* User Rank Card */}
            {userRank && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-full p-3">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Your Current Rank</p>
                            <p className="text-3xl font-bold">#{userRank}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    </div>
                ) : globalLeaderboard.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-500">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                        <p>No leaderboard data available yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Rank
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Score
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Tests
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Accuracy
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        Streak
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {globalLeaderboard.map((entry) => (
                                    <tr
                                        key={entry.userId}
                                        className={`
                                            border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors
                                            ${getRankStyle(entry.rank)}
                                        `}
                                    >
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            {getRankIcon(entry.rank)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {entry.firstName} {entry.lastName}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                {entry.score.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                            {entry.testsTaken}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium
                                                    ${entry.averageAccuracy >= 80
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : entry.averageAccuracy >= 60
                                                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}
                                                `}
                                            >
                                                {entry.averageAccuracy}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="w-4 h-4 text-orange-500" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {entry.streak} days
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <p>Leaderboard updates every hour based on completed tests</p>
            </div>
        </div>
    );
}
