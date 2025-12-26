import React from 'react';
import type { StudyPlan } from '../../services/studyPlanService';

interface PlanStatusIndicatorProps {
  plan: StudyPlan;
}

const PlanStatusIndicator: React.FC<PlanStatusIndicatorProps> = ({ plan }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'text-green-600 bg-green-100';
      case 'behind':
        return 'text-red-600 bg-red-100';
      case 'ahead':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on_track':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
      case 'behind':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        );
      case 'ahead':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'On Track';
      case 'behind':
        return 'Behind Schedule';
      case 'ahead':
        return 'Ahead of Schedule';
      default:
        return 'Unknown';
    }
  };

  const getDaysRemaining = () => {
    const examDate = new Date(plan.targetExamDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const progressPercentage = Math.round((plan.completedTasks / plan.totalTasks) * 100);

  return (
    <div className="plan-status-indicator">
      <div className="status-header">
        <div className="status-badge">
          <div className={`status-icon ${getStatusColor(plan.progressStatus)}`}>
            {getStatusIcon(plan.progressStatus)}
          </div>
          <span className="status-text">{getStatusText(plan.progressStatus)}</span>
        </div>
        <div className="exam-date">
          <span className="date-label">Exam Date:</span>
          <span className="date-value">
            {new Date(plan.targetExamDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="progress-overview">
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-value">{plan.completedTasks}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-value">{plan.totalTasks - plan.completedTasks}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat">
            <span className="stat-value">{daysRemaining}</span>
            <span className="stat-label">Days Left</span>
          </div>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Study plan progress: ${progressPercentage}% complete`}
            />
          </div>
          <span className="progress-text">{progressPercentage}% Complete</span>
        </div>
      </div>

      <div className="plan-details">
        <div className="detail-item">
          <span className="detail-label">Study Hours:</span>
          <span className="detail-value">{plan.hoursPerDay}h per day</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Total Tasks:</span>
          <span className="detail-value">{plan.totalTasks}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Created:</span>
          <span className="detail-value">
            {new Date(plan.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlanStatusIndicator;
