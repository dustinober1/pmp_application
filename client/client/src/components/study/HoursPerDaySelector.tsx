import React from 'react';

interface HoursPerDaySelectorProps {
  value: number;
  onChange: (hours: number) => void;
  error?: string;
}

const HoursPerDaySelector: React.FC<HoursPerDaySelectorProps> = ({
  value,
  onChange,
  error
}) => {
  const commonOptions = [0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 8];
  
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseFloat(e.target.value);
    onChange(hours);
  };

  const handleOptionClick = (hours: number) => {
    onChange(hours);
  };

  const getStudyDescription = (hours: number) => {
    if (hours < 1) return 'Light study sessions';
    if (hours < 2) return 'Moderate study pace';
    if (hours < 4) return 'Dedicated study schedule';
    if (hours < 6) return 'Intensive preparation';
    return 'Full-time study commitment';
  };

  const getTotalWeeklyHours = () => {
    return (value * 7).toFixed(1);
  };

  return (
    <div className="hours-per-day-selector">
      <label htmlFor="hours-per-day" className="form-label">
        Study Hours Per Day
      </label>
      
      <div className="hours-input-container">
        <div className="slider-container">
          <input
            id="hours-per-day"
            type="range"
            min="0.5"
            max="12"
            step="0.5"
            value={value}
            onChange={handleSliderChange}
            className="hours-slider"
            aria-describedby={error ? 'hours-error' : 'hours-info'}
            aria-invalid={!!error}
          />
          <div className="slider-value">
            {value} hour{value !== 1 ? 's' : ''} per day
          </div>
        </div>
        
        <div className="quick-options">
          <span className="quick-options-label">Quick select:</span>
          <div className="option-buttons">
            {commonOptions.map((hours) => (
              <button
                key={hours}
                type="button"
                className={`option-button ${value === hours ? 'active' : ''}`}
                onClick={() => handleOptionClick(hours)}
                aria-label={`Set ${hours} hour${hours !== 1 ? 's' : ''} per day`}
                aria-pressed={value === hours}
              >
                {hours}h
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {error && (
        <div id="hours-error" className="form-error" role="alert">
          {error}
        </div>
      )}
      
      <div id="hours-info" className="form-help">
        <div className="hours-summary">
          <span className="weekly-hours">
            {getTotalWeeklyHours()} hours per week
          </span>
          <span className="study-description">
            {getStudyDescription(value)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HoursPerDaySelector;
