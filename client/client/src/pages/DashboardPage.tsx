import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import progressService from '../services/progressService';
import type { DashboardData } from '../services/progressService';
import { SkeletonDashboard } from '../components/ui/Skeleton';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const dashboardData = await progressService.getDashboard();
                setData(dashboardData);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-page">
                <SkeletonDashboard />
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <h2>Unable to load dashboard</h2>
                <p>{error}</p>
                <Link to="/" className="btn-primary">Go Home</Link>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const { overview, streak, domainStats, weeklyPerformance, recentTests } = data;

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                {/* Header */}
                <header className="dashboard-header">
                    <div>
                        <h1>Welcome back, {user?.firstName}!</h1>
                        <p>Here's your PMP preparation progress</p>
                    </div>
                    <Link to="/practice" className="btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                        Start Practice
                    </Link>
                </header>

                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon fire">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 23c-5.14 0-9.32-4.18-9.32-9.32 0-3.09 1.33-5.94 3.53-8.18l1.35 1.35C5.89 8.52 4.68 10.81 4.68 13.68 4.68 18.22 8.46 22 13 22s8.32-3.78 8.32-8.32c0-2.87-1.21-5.16-2.88-6.83l1.35-1.35c2.2 2.24 3.53 5.09 3.53 8.18 0 5.14-4.18 9.32-9.32 9.32z" />
                                <path d="M12 18c-2.5 0-4.5-2-4.5-4.5 0-1.5 1-3 2-4l1.5 1.5c-.5.5-1.5 1.5-1.5 2.5 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5c0-1-.5-2-1.5-2.5l1.5-1.5c1 1 2 2.5 2 4 0 2.5-2 4.5-4.5 4.5z" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{streak.currentStreak}</span>
                            <span className="stat-label">Day Streak</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon questions">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <path d="M12 17h.01" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{overview.totalQuestionsAnswered}</span>
                            <span className="stat-label">Questions Answered</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon accuracy">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{overview.overallAccuracy}%</span>
                            <span className="stat-label">Overall Accuracy</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon tests">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{overview.testsCompleted}</span>
                            <span className="stat-label">Tests Completed</span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="dashboard-grid">
                    {/* Domain Performance */}
                    <section className="dashboard-card domain-performance">
                        <h2>Domain Performance</h2>
                        <div className="domain-list">
                            {domainStats.map((domain) => (
                                <div key={domain.domainId} className="domain-item">
                                    <div className="domain-header">
                                        <div className="domain-info">
                                            <span
                                                className="domain-dot"
                                                style={{ backgroundColor: domain.color }}
                                            />
                                            <span className="domain-name">{domain.domain}</span>
                                            <span className="domain-weight">({domain.weight}%)</span>
                                        </div>
                                        <span className="domain-accuracy">{domain.accuracy}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${domain.accuracy}%`,
                                                backgroundColor: domain.color,
                                            }}
                                        />
                                    </div>
                                    <div className="domain-stats">
                                        <span>{domain.correctAnswers} / {domain.questionsAnswered} correct</span>
                                    </div>
                                </div>
                            ))}
                            {domainStats.length === 0 && (
                                <div className="empty-state">
                                    <p>No questions answered yet. Start a practice test to see your progress!</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Weekly Activity */}
                    <section className="dashboard-card weekly-activity">
                        <h2>Weekly Activity</h2>
                        <div className="weekly-chart">
                            {weeklyPerformance.map((day) => {
                                const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
                                const height = day.total > 0 ? Math.max(20, Math.min(100, day.total * 10)) : 0;

                                return (
                                    <div key={day.date} className="day-bar">
                                        <div className="bar-container">
                                            <div
                                                className="bar"
                                                style={{
                                                    height: `${height}%`,
                                                    backgroundColor: day.total > 0 ? '#6366f1' : '#e5e7eb'
                                                }}
                                            />
                                        </div>
                                        <span className="day-label">{dayName}</span>
                                        <span className="day-count">{day.total}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Streak Card */}
                    <section className="dashboard-card streak-card">
                        <h2>Study Streak</h2>
                        <div className="streak-content">
                            <div className="streak-main">
                                <div className="streak-flame">🔥</div>
                                <div className="streak-number">{streak.currentStreak}</div>
                                <div className="streak-text">day streak</div>
                            </div>
                            <div className="streak-stats">
                                <div className="streak-stat">
                                    <span className="streak-stat-value">{streak.longestStreak}</span>
                                    <span className="streak-stat-label">Longest</span>
                                </div>
                                <div className="streak-stat">
                                    <span className="streak-stat-value">{streak.totalStudyDays}</span>
                                    <span className="streak-stat-label">Total Days</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Recent Tests */}
                    <section className="dashboard-card recent-tests">
                        <h2>Recent Tests</h2>
                        {recentTests.length > 0 ? (
                            <div className="test-list">
                                {recentTests.slice(0, 5).map((test) => (
                                    <div key={test.id} className="test-item">
                                        <div className="test-info">
                                            <span className="test-name">{test.testName}</span>
                                            <span className="test-date">
                                                {new Date(test.completedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="test-score">
                                            <span className={`score ${test.accuracy >= 70 ? 'pass' : 'fail'}`}>
                                                {test.accuracy}%
                                            </span>
                                            <span className="test-details">
                                                {test.correctAnswers}/{test.totalQuestions}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No tests completed yet.</p>
                                <Link to="/practice" className="btn-secondary">Take a Test</Link>
                            </div>
                        )}
                    </section>
                </div>

                {/* Quick Actions */}
                <section className="quick-actions">
                    <h2>Continue Learning</h2>
                    <div className="action-cards">
                        <Link to="/practice" className="action-card">
                            <div className="action-icon practice">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h3>Practice Tests</h3>
                                <p>Challenge yourself with full-length exams</p>
                            </div>
                            <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </Link>

                        <Link to="/flashcards" className="action-card">
                            <div className="action-icon flashcards">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <path d="M8 21h8M12 17v4" />
                                </svg>
                            </div>
                            <div className="action-content">
                                <h3>Flashcards</h3>
                                <p>Review key concepts with spaced repetition</p>
                            </div>
                            <svg className="action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DashboardPage;
