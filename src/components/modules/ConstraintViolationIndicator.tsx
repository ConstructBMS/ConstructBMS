import React, { useState } from 'react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { ConstraintViolation } from '../services/dependencyConstraintsService';

interface ConstraintViolationIndicatorProps {
  className?: string;
  violations: ConstraintViolation[];
}

const ConstraintViolationIndicator: React.FC<ConstraintViolationIndicatorProps> = ({
  violations,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (violations.length === 0) {
    return null;
  }

  const errorCount = violations.filter(v => v.severity === 'error').length;
  const warningCount = violations.filter(v => v.severity === 'warning').length;

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className="flex items-center space-x-1 px-2 py-1 rounded-md text-sm font-medium cursor-help"
        style={{
          backgroundColor: errorCount > 0 ? '#fef2f2' : '#fffbeb',
          color: errorCount > 0 ? '#dc2626' : '#d97706',
          border: `1px solid ${errorCount > 0 ? '#fecaca' : '#fed7aa'}`
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <ExclamationTriangleIcon className="w-4 h-4" />
        <span>
          {errorCount > 0 && `${errorCount} Error${errorCount !== 1 ? 's' : ''}`}
          {errorCount > 0 && warningCount > 0 && ' + '}
          {warningCount > 0 && `${warningCount} Warning${warningCount !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded shadow-lg z-50 max-w-md">
          <div className="space-y-2">
            <div className="font-medium">Constraint Violations</div>
            <div className="space-y-1">
              {violations.slice(0, 5).map((violation, index) => (
                <div key={index} className="text-xs">
                  <div className="flex items-start space-x-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${
                      violation.severity === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <div className="font-medium">
                        {violation.type} Constraint
                      </div>
                      <div className="text-gray-300">
                        {violation.violation}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {violations.length > 5 && (
                <div className="text-xs text-gray-400 pt-1">
                  +{violations.length - 5} more violations
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default ConstraintViolationIndicator; 