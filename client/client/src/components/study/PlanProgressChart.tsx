import React from 'react';
import type { StudyPlan, StudyPlanTask } from '../../services/studyPlanService';

interface PlanProgressChartProps {
  plan: StudyPlan;
  tasks: StudyPlanTask[];
}

const PlanProgressChart: React.FC<PlanProgressChartProps> = ({ plan, tasks }) => {
  // Calculate progress by domain
  const getDomainProgress = () => {
    const domainStats: Record<string, { total: number; completed: number; name: string }> = {};
    
    tasks.forEach(task => {
      const domain = task.domain || 'General';
      if (!domainStats[domain]) {
        domainStats[domain] = { total: 0, completed: 0, name: domain };
      }
      domainStats[domain].total++;
      if (task.isCompleted) {
        domainStats[domain].completed++;
      }
    });
    
    return Object.entries(domainStats).map(([domain, stats]) => ({
      domain,
      name: stats.name,
      total: stats.total,
      completed: stats.completed,
      percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }));
  };

  // Calculate weekly progress
  const getWeeklyProgress = () => {
    const weeklyStats: Record<string, { total: number; completed: number }> = {};
    
    tasks.forEach(task => {
      const taskDate = new Date(task.scheduledDate);
      const weekStart = new Date(taskDate);
      weekStart.setDate(taskDate.getDate() - taskDate.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = { total: 0, completed: 0 };
      }
      weeklyStats[weekKey].total++;
      if (task.isCompleted) {
        weeklyStats[weekKey].completed++;
      }
    });
    
    return Object.entries(weeklyStats)
      .map(([week, stats]) => ({
        week,
        total: stats.total,
        completed: stats.completed,
        percentage: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks
  };

  // Calculate completion trend
  const getCompletionTrend = () => {
    const dailyStats: Record<string, { completed: number; date: string }> = {};
    
    // Initialize with all dates from plan start to today
    const startDate = new Date(plan.createdAt);
    const today = new Date();
    const currentDate = new Date(startDate);
    
    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyStats[dateKey] = { completed: 0, date: dateKey };
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fill in actual completion data
    tasks.forEach(task => {
      if (task.isCompleted && task.completedAt) {
        const dateKey = task.completedAt.split('T')[0];
        if (dailyStats[dateKey]) {
          dailyStats[dateKey].completed++;
        }
      }
    });
    
    return Object.values(dailyStats)
      .slice(-30) // Last 30 days
      .map((stat, index, array) => ({
        date: stat.date,
        completed: stat.completed,
        cumulative: array.slice(0, index + 1).reduce((sum, s) => sum + s.completed, 0)
      }));
  };

  const domainProgress = getDomainProgress();
  const weeklyProgress = getWeeklyProgress();
  const completionTrend = getCompletionTrend();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const overallProgress = Math.round((plan.completedTasks / plan.totalTasks) * 100);

  return (
    <div className="plan-progress-chart">
      <div className="chart-header">
        <h3>Progress Overview</h3>
        <div className="overall-progress">
          <div className="progress-circle">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#6366f1"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallProgress / 100)}`}
                transform="rotate(-90 60 60)"
                className="progress-circle-fill"
              />
              <text
                x="60"
                y="60"
                textAnchor="middle"
                dominantBaseline="middle"
                className="progress-text"
              >
                <tspan x="60" y="55" fontSize="24" fontWeight="bold" fill="#1f2937">
                  {overallProgress}%
                </tspan>
                <tspan x="60" y="75" fontSize="12" fill="#6b7280">
                  Complete
                </tspan>
              </text>
            </svg>
          </div>
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-value">{plan.completedTasks}</span>
              <span className="stat-label">Tasks Done</span>
            </div>
            <div className="stat">
              <span className="stat-value">{plan.totalTasks - plan.completedTasks}</span>
              <span className="stat-label">To Do</span>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Progress */}
      {domainProgress.length > 1 && (
        <div className="chart-section">
          <h4>Progress by Domain</h4>
          <div className="domain-progress-list">
            {domainProgress.map(domain => (
              <div key={domain.domain} className="domain-progress-item">
                <div className="domain-info">
                  <span className="domain-name">{domain.name}</span>
                  <span className="domain-count">{domain.completed}/{domain.total}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${domain.percentage}%` }}
                    role="progressbar"
                    aria-valuenow={domain.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${domain.name} progress: ${domain.percentage}%`}
                  />
                </div>
                <span className="progress-percentage">{domain.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Progress */}
      {weeklyProgress.length > 0 && (
        <div className="chart-section">
          <h4>Weekly Progress</h4>
          <div className="weekly-chart">
            <div className="chart-bars">
              {weeklyProgress.map((week, index) => (
                <div key={week.week} className="week-bar">
                  <div className="bar-container">
                    <div
                      className="bar"
                      style={{
                        height: `${Math.max(10, week.percentage)}%`,
                        backgroundColor: week.percentage >= 80 ? '#10b981' : week.percentage >= 50 ? '#6366f1' : '#f59e0b'
                      }}
                      role="progressbar"
                      aria-valuenow={week.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Week ${index + 1} progress: ${week.percentage}%`}
                    />
                  </div>
                  <span className="bar-label">W{index + 1}</span>
                  <span className="bar-value">{week.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Completion Trend */}
      {completionTrend.length > 1 && (
        <div className="chart-section">
          <h4>Completion Trend (Last 30 Days)</h4>
          <div className="trend-chart">
            <div className="trend-line">
              {completionTrend.map((point, index) => {
                const maxCompleted = Math.max(...completionTrend.map(p => p.cumulative));
                const height = maxCompleted > 0 ? (point.cumulative / maxCompleted) * 100 : 0;
                
                return (
                  <div key={point.date} className="trend-point">
                    <div
                      className="point"
                      style={{
                        bottom: `${height}%`,
                        left: `${(index / (completionTrend.length - 1)) * 100}%`
                      }}
                      title={`${formatDate(point.date)}: ${point.cumulative} tasks`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="trend-labels">
              <span className="label-start">{formatDate(completionTrend[0].date)}</span>
              <span className="label-end">{formatDate(completionTrend[completionTrend.length - 1].date)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanProgressChart;
