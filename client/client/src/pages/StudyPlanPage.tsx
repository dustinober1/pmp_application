import React from 'react';
import { useNavigate } from 'react-router-dom';
import StudyPlanWizard from '../components/study/StudyPlanWizard';
import './StudyPlanPage.css';

const StudyPlanPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePlanCreated = () => {
    // Navigate to the study plan dashboard
    navigate('/study-plan/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="study-plan-page">
      <div className="page-container">
        <StudyPlanWizard
          onSuccess={handlePlanCreated}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default StudyPlanPage;
