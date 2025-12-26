import React from 'react';

interface ExamDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  error?: string;
}

const ExamDatePicker: React.FC<ExamDatePickerProps> = ({
  value,
  onChange,
  minDate,
  error
}) => {
  // Calculate minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = minDate || tomorrow.toISOString().split('T')[0];

  // Calculate maximum date (2 years from now)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const getDaysUntilExam = () => {
    if (!value) return null;
    
    const examDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    
    const diffTime = examDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysUntil = getDaysUntilExam();

  return (
    <div className="exam-date-picker">
      <label htmlFor="exam-date" className="form-label">
        Target Exam Date
      </label>
      <input
        id="exam-date"
        type="date"
        value={value}
        onChange={handleChange}
        min={minDateStr}
        max={maxDateStr}
        className={`form-input ${error ? 'error' : ''}`}
        aria-describedby={error ? 'exam-date-error' : daysUntil !== null ? 'exam-date-info' : undefined}
        aria-invalid={!!error}
      />
      
      {error && (
        <div id="exam-date-error" className="form-error" role="alert">
          {error}
        </div>
      )}
      
      {daysUntil !== null && !error && (
        <div id="exam-date-info" className="form-help">
          {daysUntil < 0 ? (
            <span className="text-red-600">Exam date is in the past</span>
          ) : daysUntil === 0 ? (
            <span className="text-orange-600">Exam is today!</span>
          ) : daysUntil === 1 ? (
            <span className="text-blue-600">Exam is tomorrow</span>
          ) : (
            <span className="text-gray-600">
              {daysUntil} days until exam ({Math.ceil(daysUntil / 7)} weeks)
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ExamDatePicker;
