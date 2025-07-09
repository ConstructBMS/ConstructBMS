import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

interface DatabaseStatusProps {
  className?: string;
}

export const DatabaseStatus: React.FC<DatabaseStatusProps> = ({
  className = '',
}) => {
  const [status, setStatus] = useState<
    'checking' | 'healthy' | 'unhealthy' | 'error'
  >('checking');
  const [error, setError] = useState<string>('');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkDatabaseHealth = async () => {
    setStatus('checking');
    setError('');

    try {
      const startTime = Date.now();

      const { data, error: dbError } = await supabase
        .from('user_settings')
        .select('id')
        .limit(1);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (dbError) {
        setStatus('error');
        setError(`Database error: ${dbError.message} (${responseTime}ms)`);
      } else {
        setStatus('healthy');
        setError(`Connected successfully (${responseTime}ms)`);
      }

      setLastCheck(new Date());
    } catch (err: any) {
      setStatus('error');
      setError(`Connection failed: ${err.message}`);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    checkDatabaseHealth();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'unhealthy':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return '✅';
      case 'unhealthy':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className='flex items-center justify-between mb-2'>
        <h3 className='text-sm font-medium'>Database Status</h3>
        <button
          onClick={checkDatabaseHealth}
          disabled={status === 'checking'}
          className='text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
        >
          {status === 'checking' ? 'Checking...' : 'Refresh'}
        </button>
      </div>

      <div className='flex items-center space-x-2'>
        <span className='text-lg'>{getStatusIcon()}</span>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {status === 'checking' && 'Checking connection...'}
          {status === 'healthy' && 'Database healthy'}
          {status === 'unhealthy' && 'Database slow'}
          {status === 'error' && 'Database error'}
        </span>
      </div>

      {error && <div className='mt-2 text-xs text-gray-600'>{error}</div>}

      {lastCheck && (
        <div className='mt-1 text-xs text-gray-500'>
          Last checked: {lastCheck.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};
