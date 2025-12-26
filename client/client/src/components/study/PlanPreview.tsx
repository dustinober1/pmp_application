import React from 'react';

interface PlanPreviewProps {
  targetExamDate: string;
  hoursPerDay: number;
  isLoading?: boolean;
}

interface GeneratedPlan {
  totalDays: number;
  totalStudyHours: number;
  estimatedCompletionDate: string;
  weeklyBreakdown: {
    week: number;
    hours: number;
    focusAreas: string[];
  }[];
  recommendations: string[];
}

const PlanPreview: React.FC<PlanPreviewProps> = ({
  targetExamDate,
  hoursPerDay,
  isLoading = false
}) => {
  const generatePlanPreview = (): GeneratedPlan | null => {
    if (!targetExamDate || !hoursPerDay) return null;

    const examDate = new Date(targetExamDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    const totalDays = Math.max(0, Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    const totalStudyHours = totalDays * hoursPerDay;
    
    // Generate weekly breakdown
    const weeklyBreakdown = [];
    const totalWeeks = Math.ceil(totalDays / 7);
    
    for (let week = 1; week <= Math.min(totalWeeks, 12); week++) {
      const weekStart = (week - 1) * 7;
      const weekEnd = Math.min(week * 7, totalDays);
      const daysInWeek = weekEnd - weekStart;
      const weekHours = daysInWeek * hoursPerDay;
      
      let focusAreas: string[] = [];
      if (week <= 2) focusAreas = ['Foundation & Basics', 'Process Framework'];
      else if (week <= 4) focusAreas = ['People Management', 'Stakeholder Management'];
      else if (week <= 6) focusAreas = ['Business Environment', 'Quality Management'];
      else if (week <= 8) focusAreas = ['Procurement', 'Risk Management'];
      else if (week <= 10) focusAreas = ['Communication', 'Integration Management'];
      else focusAreas = ['Practice Tests', 'Review & Refinement'];
      
      weeklyBreakdown.push({
        week,
        hours: weekHours,
        focusAreas
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (totalDays < 30) {
      recommendations.push('Limited time available - Focus on high-weight domains and practice tests');
    } else if (totalDays > 90) {
      recommendations.push('Plenty of time - Consider a balanced approach with regular reviews');
    }
    
    if (hoursPerDay < 2) {
      recommendations.push('Light schedule - Make the most of weekends for longer sessions');
    } else if (hoursPerDay > 4) {
      recommendations.push('Intensive schedule - Remember to take regular breaks to avoid burnout');
    }
    
    recommendations.push('Include regular practice tests to track progress');
    recommendations.push('Focus on weak areas identified in previous attempts');

    return {
      totalDays,
      totalStudyHours,
      estimatedCompletionDate: examDate.toISOString().split('T')[0],
      weeklyBreakdown,
      recommendations
    };
  };

  const plan = generatePlanPreview();

  if (isLoading) {
    return (
      <div className="plan-preview loading">
        <div className="preview-header">
          <h3>Study Plan Preview</h3>
        </div>
        <div className="preview-content">
          <div className="skeleton-lines">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="plan-preview empty">
        <div className="preview-header">
          <h3>Study Plan Preview</h3>
        </div>
        <div className="preview-content">
          <p className="empty-message">
            Select your exam date and study hours to see a preview of your personalized study plan.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="plan-preview">
      <div className="preview-header">
        <h3>Study Plan Preview</h3>
        <div className="plan-summary">
          <div className="summary-item">
            <span className="summary-label">Duration:</span>
            <span className="summary-value">{plan.totalDays} days</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Study Time:</span>
            <span className="summary-value">{plan.totalStudyHours.toFixed(1)} hours</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Target Date:</span>
            <span className="summary-value">{formatDate(plan.estimatedCompletionDate)}</span>
          </div>
        </div>
      </div>

      <div className="preview-content">
        <div className="weekly-breakdown">
          <h4>Weekly Focus Areas</h4>
          <div className="weeks-grid">
            {plan.weeklyBreakdown.slice(0, 8).map((week) => (
              <div key={week.week} className="week-card">
                <div className="week-header">
                  <span className="week-number">Week {week.week}</span>
                  <span className="week-hours">{week.hours}h</span>
                </div>
                <div className="week-focus">
                  {week.focusAreas.map((area, idx) => (
                    <span key={idx} className="focus-area">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {plan.weeklyBreakdown.length > 8 && (
              <div className="week-card more-weeks">
                <span className="week-number">+{plan.weeklyBreakdown.length - 8} weeks</span>
                <span className="week-hours">
                  {plan.weeklyBreakdown.slice(8).reduce((sum, w) => sum + w.hours, 0)}h
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="recommendations">
          <h4>Recommendations</h4>
          <ul className="recommendation-list">
            {plan.recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PlanPreview;
