'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import type { TeamDashboard, Team } from '@pmp/shared';
import { useToast } from '@/components/ToastProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { FullPageSkeleton } from '@/components/FullPageSkeleton';

export default function TeamDashboardPage() {
  const router = useRouter();
  const { user, canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [dashboard, setDashboard] = useState<TeamDashboard | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const fetchTeamData = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Get User's Teams
      const teamsResponse = await apiRequest<{ teams: Team[] }>('/teams');
      const teams = teamsResponse.data?.teams || [];

      if (teams.length === 0) {
        // No team found - strictly for corporate tier
        // Ideally redirect to pricing or create team page
        setLoading(false);
        return;
      }

      // For MVP, pick the first team
      const currentTeam = teams[0];
      if (!currentTeam) {
        setLoading(false);
        return;
      }
      setTeam(currentTeam);

      // 2. Get Dashboard Data for this Team
      const dashboardResponse = await apiRequest<{ dashboard: TeamDashboard }>(
        `/teams/${currentTeam.id}/dashboard`
      );

      if (dashboardResponse.data) {
        setDashboard(dashboardResponse.data.dashboard);
      }
    } catch (error) {
      console.error('Failed to load team data', error);
      toast.error('Failed to load team dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (canAccess) {
      void fetchTeamData();
    }
  }, [canAccess, fetchTeamData]);

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !inviteEmail) return;

    setInviting(true);
    setInviteResult(null);

    try {
      await apiRequest(`/teams/${team.id}/invitations`, {
        method: 'POST',
        body: { email: inviteEmail },
      });
      setInviteResult({ type: 'success', message: `Invitation sent to ${inviteEmail}` });
      setInviteEmail('');
      // Refresh dashboard to potentially update stats/license counts if we tracked pending invites (optional)
    } catch (error: unknown) {
      console.error('Invite failed', error);
      const message = error instanceof Error ? error.message : 'Failed to send invitation';
      setInviteResult({ type: 'error', message });
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const isAdmin = !!(user && team && team.adminId === user.id);
    if (!isAdmin) {
      toast.error('Only team admins can remove members.');
      return;
    }
    if (!team || !confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;

    try {
      // Using preserve endpoint to keep data (11.5 requirement)
      await apiRequest(`/teams/${team.id}/members/${memberId}/preserve`, {
        method: 'DELETE',
      });
      // Refresh data
      fetchTeamData();
    } catch (error) {
      console.error('Failed to remove member', error);
      toast.error('Failed to remove member. Please try again.');
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!team) return;
    try {
      await apiRequest(`/teams/${team.id}/alerts/${alertId}/acknowledge`, { method: 'POST' });
      // Optimistically remove from UI
      if (dashboard) {
        setDashboard({
          ...dashboard,
          alerts: dashboard.alerts.filter(a => a.id !== alertId),
        });
      }
    } catch (error) {
      console.error('Failed to acknowledge alert', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!team || !dashboard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">No Team Found</h2>
        <p className="text-gray-400 mb-8">You do not seem to have a corporate team set up yet.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-2 bg-gray-800 rounded hover:bg-gray-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{dashboard.teamName}</h1>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>
              Members: <span className="text-white font-medium">{dashboard.totalMembers}</span>
            </span>
            <span>
              Active: <span className="text-green-400 font-medium">{dashboard.activeMembers}</span>
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Avg. Progress</div>
            <div className="text-2xl font-bold text-primary-400">{dashboard.averageProgress}%</div>
          </div>
          <div className="text-right pl-6 border-l border-gray-700">
            <div className="text-sm text-gray-400">Avg. Readiness</div>
            <div className="text-2xl font-bold text-green-400">
              {dashboard.averageReadinessScore}%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Member List */}
        <div className="lg:col-span-2 space-y-8">
          {/* Alerts Section */}
          {dashboard.alerts.length > 0 && (
            <div className="bg-gray-800/50 border border-yellow-900/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="text-yellow-500 mr-2" aria-hidden="true">
                  ⚠️
                </span>{' '}
                Needs Attention
              </h3>
              <div className="space-y-3">
                {dashboard.alerts.map(alert => (
                  <div
                    key={alert.id}
                    className="flex justify-between items-center bg-gray-900/50 p-4 rounded-lg border border-gray-800"
                  >
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs uppercase font-bold mr-3 ${
                          alert.type === 'inactive'
                            ? 'bg-gray-700 text-gray-300'
                            : alert.type === 'struggling'
                              ? 'bg-red-900/50 text-red-400'
                              : 'bg-yellow-900/50 text-yellow-400'
                        }`}
                      >
                        {alert.type.replace('_', ' ')}
                      </span>
                      <span className="text-gray-300">{alert.message}</span>
                    </div>
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      className="text-gray-500 hover:text-white text-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Team Members</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-800/50 text-gray-400 text-sm uppercase tracking-wider">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4">Last Active</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {dashboard.memberStats.map(member => (
                    <tr key={member.memberId} className="hover:bg-gray-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">{member.userName}</div>
                        {/* <div className="text-sm text-gray-500">{member.email} - need email in response ideally</div> */}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-500"
                              style={{ width: `${member.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-300 text-sm">{member.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {member.lastActiveDate
                          ? new Date(member.lastActiveDate).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user && team?.adminId === user.id && member.userId !== user.id ? (
                          <button
                            onClick={() => handleRemoveMember(member.userId, member.userName)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium transition"
                          >
                            Remove
                          </button>
                        ) : (
                          <span className="text-gray-600 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {dashboard.memberStats.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No members found. Invite someone to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Actions */}
        <div className="space-y-8">
          {/* Invite Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Invite Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label htmlFor="invite-email" className="block text-sm text-gray-400 mb-1">
                  Email Address
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500 transition"
                />
              </div>
              {inviteResult && (
                <div
                  className={`p-3 rounded text-sm ${inviteResult.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}
                >
                  {inviteResult.message}
                </div>
              )}
              <button
                type="submit"
                disabled={inviting}
                className="w-full py-2 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-200 transition disabled:opacity-50"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                You have used {dashboard.totalMembers} of 10 licenses.
              </p>
            </form>
          </div>

          {/* Quick Stats or Goals could go here */}
          {/* Placeholder for Goals Widget */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 opacity-60">
            <h3 className="text-lg font-bold text-gray-400 mb-4">Team Goals</h3>
            <div className="text-center py-8 text-gray-600">Goals feature coming soon</div>
          </div>
        </div>
      </div>
    </div>
  );
}
