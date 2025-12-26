import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import studyPlanService from '../../services/studyPlanService';
import PlanStatusIndicator from './PlanStatusIndicator';
import DailyTaskList from './DailyTaskList';
import PlanProgressChart from './PlanProgressChart';
import './StudyPlanDashboard.css';

const StudyPlanDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: plan, isLoading: planLoading, error: planError } = useQuery({
    queryKey: ['active-study-plan'],
    queryFn: studyPlanService.getActiveStudyPlan,
    retry: false
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['study-plan-tasks', plan?.id],
    queryFn: () => studyPlanService.getStudyPlanTasks(plan!.id),
    enabled: !!plan
  });

  if (planLoading) {
    return (
      <div className="study-plan-dashboard loading">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-content">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>
      </div>
    );
  }

  if (planError || !plan) {
    return (
      <div className="study-plan-dashboard error">
        <div className="error-content">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6m0 4v.01" />
            </svg>
          </div>
          <h2>No Active Study Plan</h2>
          <p>You don't have an active study plan. Create one to get started!</p>
          <div className="error-actions">
            <button
              className="btn-primary"
              onClick={() => navigate('/study-plan')}
            >
              Create Study Plan
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleEditPlan = () => {
    navigate('/study-plan');
  };

  const getUpcomingTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    const upcomingTasks = tasks
      .filter(task => !task.isCompleted && task.scheduledDate >= today)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);
    
    return upcomingTasks;
  };

  const getRecentCompleted = () => {
    const recentCompleted = tasks
      .filter(task => task.isCompleted && task.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 5);
    
    return recentCompleted;
  };

  const upcomingTasks = getUpcomingTasks();
  const recentCompleted = getRecentCompleted();

  return (
    <div className="study-plan-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Study Plan Dashboard</h1>
          <p>Track your progress and stay on schedule</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleEditPlan}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Plan
          </button>
          <button className="btn-primary" onClick={() => navigate('/practice')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Practice
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Plan Status */}
        <div className="dashboard-card status-card">
          <PlanStatusIndicator plan={plan} />
        </div>

        {/* Daily Tasks */}
        <div className="dashboard-card tasks-card">
          <DailyTaskList
            planId={plan.id}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Progress Chart */}
        <div className="dashboard-card progress-card">
          <PlanProgressChart plan={plan} tasks={tasks} />
        </div>

        {/* Quick Stats */}
        <div className="dashboard-card stats-card">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{plan.completedTasks}</span>
                <span className="stat-label">Tasks Completed</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{plan.totalTasks - plan.completedTasks}</span>
                <span className="stat-label">Tasks Remaining</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">{Math.round((plan.completedTasks / plan.totalTasks) * 100)}%</span>
                <span className="stat-label">Progress</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-value">
                  {Math.ceil((new Date(plan.targetExamDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                </span>
                <span className="stat-label">Days Until Exam</span>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="dashboard-card upcoming-card">
          <h3>Upcoming Tasks</h3>
          {upcomingTasks.length > 0 ? (
            <div className="task-list">
              {upcomingTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-info">
                    <span className="task-title">{task.title}</span>
                    <span className="task-date">
                      {new Date(task.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="task-meta">
                    <span className="task-duration">{task.estimatedMinutes} min</span>
                    {task.domain && (
                      <span className="task-domain">{task.domain}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No upcoming tasks. Great job staying ahead!</p>
            </div>
          )}
        </div>

        {/* Recent Completed */}
        <div className="dashboard-card recent-card">
          <h3>Recently Completed</h3>
          {recentCompleted.length > 0 ? (
            <div className="task-list">
              {recentCompleted.map(task => (
                <div key={task.id} className="task-item completed">
                  <div className="task-info">
                    <span className="task-title">{task.title}</span>
                    <span className="task-date">
                      {task.completedAt && new Date(task.completedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="completion-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No completed tasks yet. Start with today's tasks!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanDashboard;
