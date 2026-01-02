/**
 * PasswordStrength Component
 * Addresses MEDIUM-003: Missing password strength indicators
 */

import React from 'react';
import { calculatePasswordStrength } from '@/lib/validation';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password, className = '' }) => {
  const { strength, score } = calculatePasswordStrength(password);

  if (!password) return null;

  const getStrengthColor = (s: string): string => {
    switch (s) {
      case 'weak':
        return 'bg-red-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-700';
    }
  };

  const getStrengthTextColor = (s: string): string => {
    switch (s) {
      case 'weak':
        return 'text-red-400';
      case 'fair':
        return 'text-yellow-400';
      case 'strong':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden" role="progressbar">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor(strength)}`}
            style={{ width: `${(score / 6) * 100}%` }}
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={6}
            aria-label={`Password strength: ${strength}`}
          />
        </div>
        <span className={`text-xs font-medium ${getStrengthTextColor(strength)}`}>
          {strength.charAt(0).toUpperCase() + strength.slice(1)}
        </span>
      </div>

      <ul className="text-xs text-gray-400 space-y-1">
        <li className={`flex items-center gap-2 ${hasMinLength ? 'text-green-400' : ''}`}>
          <span>{hasMinLength ? '✓' : '○'}</span>
          <span>At least 8 characters</span>
        </li>
        <li className={`flex items-center gap-2 ${hasLowercase ? 'text-green-400' : ''}`}>
          <span>{hasLowercase ? '✓' : '○'}</span>
          <span>Lowercase letter</span>
        </li>
        <li className={`flex items-center gap-2 ${hasUppercase ? 'text-green-400' : ''}`}>
          <span>{hasUppercase ? '✓' : '○'}</span>
          <span>Uppercase letter</span>
        </li>
        <li className={`flex items-center gap-2 ${hasNumber ? 'text-green-400' : ''}`}>
          <span>{hasNumber ? '✓' : '○'}</span>
          <span>Number</span>
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrength;
