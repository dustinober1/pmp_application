import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import studyPlanService from '../../services/studyPlanService';
import ExamDatePicker from './ExamDatePicker';
import HoursPerDaySelector from './HoursPerDaySelector';
import PlanPreview from './PlanPreview';
import type { StudyPlan } from '../../services/studyPlanService';

interface StudyPlanWizardProps {
  onSuccess?: (plan: StudyPlan) => void;
  onCancel?: () => void;
}

const StudyPlanWizard: React.FC<StudyPlanWizardProps> = ({
  onSuccess,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    targetExamDate: '',
    hoursPerDay: 2
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user already has an active plan
  const { data: existingPlan } = useQuery({
    queryKey: ['active-study-plan'],
    queryFn: studyPlanService.getActiveStudyPlan,
    retry: false
  });

  const createPlanMutation = useMutation({
    mutationFn: studyPlanService.createStudyPlan,
    onSuccess: (plan) => {
      onSuccess?.(plan);
    },
    onError: (error: any) => {
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'Failed to create study plan. Please try again.' });
      }
    }
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.targetExamDate) {
        newErrors.targetExamDate = 'Please select your target exam date';
      } else {
        const examDate = new Date(formData.targetExamDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        examDate.setHours(0, 0, 0, 0);
        
        if (examDate <= today) {
          newErrors.targetExamDate = 'Exam date must be in the future';
        }
      }
    }

    if (step === 1) {
      if (formData.hoursPerDay < 0.5 || formData.hoursPerDay > 12) {
        newErrors.hoursPerDay = 'Study hours must be between 0.5 and 12';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      createPlanMutation.mutate({
        targetExamDate: formData.targetExamDate,
        hoursPerDay: formData.hoursPerDay
      });
    }
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, targetExamDate: date }));
    if (errors.targetExamDate) {
      setErrors(prev => ({ ...prev, targetExamDate: '' }));
    }
  };

  const handleHoursChange = (hours: number) => {
    setFormData(prev => ({ ...prev, hoursPerDay: hours }));
    if (errors.hoursPerDay) {
      setErrors(prev => ({ ...prev, hoursPerDay: '' }));
    }
  };

  const steps = [
    {
      title: 'Exam Date',
      description: 'When are you planning to take the PMP exam?',
      content: (
        <ExamDatePicker
          value={formData.targetExamDate}
          onChange={handleDateChange}
          error={errors.targetExamDate}
        />
      )
    },
    {
      title: 'Study Schedule',
      description: 'How much time can you dedicate to studying each day?',
      content: (
        <HoursPerDaySelector
          value={formData.hoursPerDay}
          onChange={handleHoursChange}
          error={errors.hoursPerDay}
        />
      )
    },
    {
      title: 'Review & Create',
      description: 'Review your study plan and create it',
      content: (
        <PlanPreview
          targetExamDate={formData.targetExamDate}
          hoursPerDay={formData.hoursPerDay}
          isLoading={createPlanMutation.isPending}
        />
      )
    }
  ];

  if (existingPlan) {
    return (
      <div className="study-plan-wizard">
        <div className="wizard-content">
          <div className="existing-plan-notice">
            <h2>You already have an active study plan</h2>
            <p>
              Your current plan targets {new Date(existingPlan.targetExamDate).toLocaleDateString()} 
              with {existingPlan.hoursPerDay} hours of study per day.
            </p>
            <div className="existing-plan-actions">
              <button
                className="btn-secondary"
                onClick={onCancel}
              >
                View Current Plan
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  // Allow creating a new plan but warn user
                  if (window.confirm('Creating a new plan will archive your current plan. Continue?')) {
                    setCurrentStep(0);
                  }
                }}
              >
                Create New Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="study-plan-wizard">
      <div className="wizard-header">
        <h2>Create Your Study Plan</h2>
        <div className="step-indicator">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-info">
                <div className="step-title">{step.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wizard-content">
        <div className="step-header">
          <h3>{steps[currentStep].title}</h3>
          <p>{steps[currentStep].description}</p>
        </div>

        <div className="step-content">
          {steps[currentStep].content}
        </div>

        {errors.submit && (
          <div className="form-error" role="alert">
            {errors.submit}
          </div>
        )}
      </div>

      <div className="wizard-footer">
        <div className="footer-actions">
          {currentStep > 0 && (
            <button
              className="btn-secondary"
              onClick={handlePrevious}
              disabled={createPlanMutation.isPending}
            >
              Previous
            </button>
          )}
          
          {currentStep < steps.length - 1 && (
            <button
              className="btn-primary"
              onClick={handleNext}
              disabled={!formData.targetExamDate || createPlanMutation.isPending}
            >
              Next
            </button>
          )}
          
          {currentStep === steps.length - 1 && (
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={!formData.targetExamDate || createPlanMutation.isPending}
            >
              {createPlanMutation.isPending ? 'Creating...' : 'Create Study Plan'}
            </button>
          )}
          
          {onCancel && (
            <button
              className="btn-ghost"
              onClick={onCancel}
              disabled={createPlanMutation.isPending}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanWizard;
