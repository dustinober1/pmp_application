import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import studyPlanService from '../../services/studyPlanService';

interface DailyTaskListProps {
  planId: string;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

const DailyTaskList: React.FC<DailyTaskListProps> = ({
  planId,
  selectedDate = new Date().toISOString().split('T')[0],
  onDateChange
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['study-plan-tasks', planId],
    queryFn: () => studyPlanService.getStudyPlanTasks(planId),
    enabled: !!planId
  });

  const completeTaskMutation = useMutation({
    mutationFn: studyPlanService.completeTask,
    onSuccess: () => {
      setSelectedTaskId(null);
    }
  });

  // Filter tasks for the selected date
  const tasksForDate = tasks.filter(task => 
    task.scheduledDate === selectedDate
  ).sort((a, b) => a.orderIndex - b.orderIndex);

  // Get tasks for the week (7 days including selected date)
  const getWeekDates = () => {
    const dates = [];
    const baseDate = new Date(selectedDate);
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const handleDateSelect = (date: string) => {
    onDateChange?.(date);
  };

  const handleTaskComplete = (taskId: string) => {
    setSelectedTaskId(taskId);
    completeTaskMutation.mutate(taskId);
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'practice_questions':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
        );
      case 'review_domain':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'flashcards':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        );
      case 'mock_exam':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTaskTypeLabel = (taskType: string) => {
    switch (taskType) {
      case 'practice_questions':
        return 'Practice Questions';
      case 'review_domain':
        return 'Domain Review';
      case 'flashcards':
        return 'Flashcards';
      case 'mock_exam':
        return 'Mock Exam';
      default:
        return 'Study Task';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday: dateString === new Date().toISOString().split('T')[0]
    };
  };

  const getTaskCountForDate = (date: string) => {
    return tasks.filter(task => task.scheduledDate === date).length;
  };

  if (isLoading) {
    return (
      <div className="daily-task-list loading">
        <div className="loading-skeleton">
          <div className="skeleton-header"></div>
          <div className="skeleton-tasks">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-task"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-task-list error">
        <div className="error-message">
          <h3>Unable to load tasks</h3>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-task-list">
      <div className="task-list-header">
        <h3>Daily Tasks</h3>
        <div className="date-selector">
          {weekDates.map(date => {
            const dateInfo = formatDate(date);
            const taskCount = getTaskCountForDate(date);
            
            return (
              <button
                key={date}
                className={`date-button ${selectedDate === date ? 'active' : ''} ${dateInfo.isToday ? 'today' : ''}`}
                onClick={() => handleDateSelect(date)}
                aria-label={`Select ${dateInfo.weekday}, ${dateInfo.month} ${dateInfo.day}`}
                aria-pressed={selectedDate === date}
              >
                <span className="date-weekday">{dateInfo.weekday}</span>
                <span className="date-day">{dateInfo.day}</span>
                <span className="date-month">{dateInfo.month}</span>
                {taskCount > 0 && (
                  <span className="task-count">{taskCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tasks-container">
        {tasksForDate.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h4>No tasks scheduled</h4>
            <p>Enjoy your day off or catch up on previous tasks!</p>
          </div>
        ) : (
          <div className="task-list">
            {tasksForDate.map(task => (
              <div
                key={task.id}
                className={`task-item ${task.isCompleted ? 'completed' : ''} ${selectedTaskId === task.id ? 'completing' : ''}`}
              >
                <div className="task-content">
                  <div className="task-icon">
                    {getTaskTypeIcon(task.taskType)}
                  </div>
                  <div className="task-details">
                    <h4 className="task-title">{task.title}</h4>
                    <p className="task-description">{task.description}</p>
                    <div className="task-meta">
                      <span className="task-type">{getTaskTypeLabel(task.taskType)}</span>
                      <span className="task-duration">{task.estimatedMinutes} min</span>
                      {task.domain && (
                        <span className="task-domain">{task.domain}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="task-actions">
                  {task.isCompleted ? (
                    <div className="completed-badge">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                      <span>Completed</span>
                    </div>
                  ) : (
                    <button
                      className="complete-task-btn"
                      onClick={() => handleTaskComplete(task.id)}
                      disabled={completeTaskMutation.isPending}
                      aria-label={`Complete task: ${task.title}`}
                    >
                      {selectedTaskId === task.id ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 11l3 3L22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                      )}
                      <span>Mark Complete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTaskList;
