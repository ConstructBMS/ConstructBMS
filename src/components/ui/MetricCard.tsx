import type { ReactNode } from 'react';
import type { ComponentType } from 'react';

export interface MetricCardProps {
  change?: {
    isPositive: boolean;
    period?: string;
    value: number;
};
  children?: ReactNode;
  className?: string;
  icon?: ComponentType<any>;
  title: string;
  trend?: 'up' | 'down' | 'neutral';
  value: string | number;
}

const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral',
  className = '',
  children
}: MetricCardProps) => {
  const trendClasses = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-muted'
  };

  return (
    <div className={`metric-card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="metric-label">{title}</p>
          <p className="metric-value">{value}</p>
          
          {change && (
            <div className={`metric-change ${trendClasses[trend]}`}>
              {change.isPositive ? '+' : ''}{change.value}%
              {change.period && <span className="text-muted ml-1">vs {change.period}</span>}
            </div>
          )}
        </div>
        
        {Icon && (
          <div className="metric-icon">
            <Icon className="w-8 h-8" />
          </div>
        )}
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default MetricCard; 
