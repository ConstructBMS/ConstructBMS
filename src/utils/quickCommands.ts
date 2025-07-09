/**
 * Quick Commands for Rapid Development
 * Pre-built commands for common development tasks
 */

// Quick component creation
export const createComponentTemplate = (name: string) => `
import React from 'react';
import { devLog } from '../utils/devHelpers';

interface ${name}Props {
  // Add your props here
}

export const ${name}: React.FC<${name}Props> = ({ }) => {
  devLog('${name} rendered');
  
  return (
    <div className="">
      {/* Your component content */}
    </div>
  );
};
`;

// Quick API service template
export const createApiServiceTemplate = (name: string) => `
import { apiClient } from './apiClient';
import { logger } from '../utils/logger';

export interface ${name}Data {
  // Define your data structure
}

export const ${name}Service = {
  async getAll(): Promise<${name}Data[]> {
    try {
      const response = await apiClient.get('/${name.toLowerCase()}');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch ${name}', error as Error);
      throw error;
    }
  },

  async getById(id: string): Promise<${name}Data> {
    try {
      const response = await apiClient.get(\`/${name.toLowerCase()}/\${id}\`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch ${name} by id', error as Error);
      throw error;
    }
  },

  async create(data: Omit<${name}Data, 'id'>): Promise<${name}Data> {
    try {
      const response = await apiClient.post('/${name.toLowerCase()}', data);
      return response.data;
    } catch (error) {
      logger.error('Failed to create ${name}', error as Error);
      throw error;
    }
  },

  async update(id: string, data: Partial<${name}Data>): Promise<${name}Data> {
    try {
      const response = await apiClient.put(\`/${name.toLowerCase()}/\${id}\`, data);
      return response.data;
    } catch (error) {
      logger.error('Failed to update ${name}', error as Error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(\`/${name.toLowerCase()}/\${id}\`);
    } catch (error) {
      logger.error('Failed to delete ${name}', error as Error);
      throw error;
    }
  },
};
`;

// Quick form validation
export const createFormValidation = (fields: string[]) => `
import { validateEmail, validatePassword } from '../utils/devHelpers';

export const validateForm = (data: any) => {
  const errors: Record<string, string> = {};
  
  ${fields.map(field => `
  if (!data.${field}) {
    errors.${field} = '${field} is required';
  }`).join('')}
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
`;

// Quick test template
export const createTestTemplate = (componentName: string) => `
import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName}')).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    const testProps = {
      // Add your test props
    };
    render(<${componentName} {...testProps} />);
    // Add your assertions
  });
});
`;

// Quick database migration template
export const createMigrationTemplate = (tableName: string) => `
-- Migration: Create ${tableName} table
-- Date: ${new Date().toISOString().split('T')[0]}

CREATE TABLE IF NOT EXISTS ${tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Add your columns here
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own ${tableName}" ON ${tableName}
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ${tableName}" ON ${tableName}
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ${tableName}" ON ${tableName}
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ${tableName}" ON ${tableName}
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_${tableName}_user_id ON ${tableName}(user_id);
CREATE INDEX idx_${tableName}_created_at ON ${tableName}(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_${tableName}_updated_at 
  BEFORE UPDATE ON ${tableName} 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
`;

// Quick utility functions
export const quickUtils = {
  // Generate random ID
  generateId: () => Math.random().toString(36).substr(2, 9),
  
  // Format file size
  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  // Generate initials from name
  getInitials: (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  },
  
  // Check if object is empty
  isEmpty: (obj: any) => {
    return Object.keys(obj).length === 0;
  },
  
  // Deep clone object
  deepClone: <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  },
  
  // Debounce function
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Throttle function
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Quick development shortcuts
export const devShortcuts = {
  // Quick component wrapper
  withLoading: (Component: React.ComponentType<any>) => {
    return ({ loading, ...props }: any) => {
      if (loading) return <div>Loading...</div>;
      return <Component {...props} />;
    };
  },
  
  // Quick error wrapper
  withError: (Component: React.ComponentType<any>) => {
    return ({ error, ...props }: any) => {
      if (error) return <div>Error: {error}</div>;
      return <Component {...props} />;
    };
  },
  
  // Quick memo wrapper
  withMemo: <P extends object>(Component: React.ComponentType<P>) => {
    return React.memo(Component);
  },
}; 