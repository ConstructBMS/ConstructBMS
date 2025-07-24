#!/usr/bin/env node

/**
 * Quick Development Script
 * Rapid prototyping and testing utilities
 */

const fs = require('fs');

const quickCommands = {
  // Quick component creation
  'create:component': (name) => {
    const template = `import React from 'react';
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
};`;
    
    const filePath = `src/components/${name}.tsx`;
    fs.writeFileSync(filePath, template);
    console.log(`✅ Created component: ${filePath}`);
  },

  // Quick service creation
  'create:service': (name) => {
    const template = `import { apiClient } from './apiClient';
import { logger } from '../utils/logger';

export interface ${name}Data {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const ${name}Service = {
  async getAll(): Promise<${name}Data[]> {
    try {
      const response = await apiClient.get('/${name.toLowerCase()}');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch ${name}', error);
      throw error;
    }
  },

  async getById(id: string): Promise<${name}Data> {
    try {
      const response = await apiClient.get(\`/${name.toLowerCase()}/\${id}\`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch ${name} by id', error);
      throw error;
    }
  },

  async create(data: Omit<${name}Data, 'id' | 'created_at' | 'updated_at'>): Promise<${name}Data> {
    try {
      const response = await apiClient.post('/${name.toLowerCase()}', data);
      return response.data;
    } catch (error) {
      logger.error('Failed to create ${name}', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<${name}Data>): Promise<${name}Data> {
    try {
      const response = await apiClient.put(\`/${name.toLowerCase()}/\${id}\`, data);
      return response.data;
    } catch (error) {
      logger.error('Failed to update ${name}', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(\`/${name.toLowerCase()}/\${id}\`);
    } catch (error) {
      logger.error('Failed to delete ${name}', error);
      throw error;
    }
  },
};`;
    
    const filePath = `src/services/${name.toLowerCase()}Service.ts`;
    fs.writeFileSync(filePath, template);
    console.log(`✅ Created service: ${filePath}`);
  },

  // Quick test creation
  'create:test': (name) => {
    const template = `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders correctly', () => {
    render(<${name} />);
    expect(screen.getByText('${name}')).toBeInTheDocument();
  });

  it('handles props correctly', () => {
    const testProps = {
      // Add your test props
    };
    render(<${name} {...testProps} />);
    // Add your assertions
  });
});`;
    
    const filePath = `src/components/__tests__/${name}.test.tsx`;
    fs.writeFileSync(filePath, template);
    console.log(`✅ Created test: ${filePath}`);
  },

  // Quick migration creation
  'create:migration': (tableName) => {
    const template = `-- Migration: Create ${tableName} table
-- Date: ${new Date().toISOString().split('T')[0]}

CREATE TABLE IF NOT EXISTS ${tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  EXECUTE FUNCTION update_updated_at_column();`;
    
    const filePath = `migrations/${new Date().toISOString().split('T')[0]}_create_${tableName}.sql`;
    fs.writeFileSync(filePath, template);
    console.log(`✅ Created migration: ${filePath}`);
  },

  // Quick validation creation
  'create:validation': (name) => {
    const template = `import { validateEmail } from '../utils/devHelpers';

export interface ${name}FormData {
  // Define your form fields
  name: string;
  email: string;
  description?: string;
}

export const validate${name}Form = (data: ${name}FormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};`;
    
    const filePath = `src/utils/validations/${name.toLowerCase()}Validation.ts`;
    fs.writeFileSync(filePath, template);
    console.log(`✅ Created validation: ${filePath}`);
  },

  // Quick context creation
  'create:context': (name) => {
    const template = `import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface ${name}State {
  // Define your state
  items: any[];
  loading: boolean;
  error: string | null;
}

interface ${name}Action {
  type: string;
  payload?: any;
}

const initialState: ${name}State = {
  items: [],
  loading: false,
  error: null,
};

const ${name}Reducer = (state: ${name}State, action: ${name}Action): ${name}State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    default:
      return state;
  }
};

interface ${name}ContextType {
  state: ${name}State;
  dispatch: React.Dispatch<${name}Action>;
}

const ${name}Context = createContext<${name}ContextType | undefined>(undefined);

export const ${name}Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(${name}Reducer, initialState);

  return (
    <${name}Context.Provider value={{ state, dispatch }}>
      {children}
    </${name}Context.Provider>
  );
};

export const use${name} = () => {
  const context = useContext(${name}Context);
  if (context === undefined) {
    throw new Error('use${name} must be used within a ${name}Provider');
  }
  return context;
};`;
    
    const filePath = `src/contexts/${name}Context.tsx`;
    fs.writeFileSync(filePath, template);
    console.log(`✅ Created context: ${filePath}`);
  },

  // Help command
  'help': () => {
    console.log(`
🚀 Quick Development Commands

Component Creation:
  create:component <Name>     - Create a new React component
  create:service <Name>       - Create a new API service
  create:test <Name>          - Create a test file
  create:migration <TableName> - Create a database migration
  create:validation <Name>    - Create form validation
  create:context <Name>       - Create a React context

Usage: node scripts/quick-dev.js <command> <name>
Examples:
  node scripts/quick-dev.js create:component UserProfile
  node scripts/quick-dev.js create:service Project
  node scripts/quick-dev.js create:migration tasks
    `);
  }
};

// Main execution
const command = process.argv[2];
const name = process.argv[3];

if (!command || !quickCommands[command]) {
  console.log('❌ Invalid command. Use "help" to see available commands.');
  process.exit(1);
}

if (command !== 'help' && !name) {
  console.log('❌ Name parameter required for this command.');
  process.exit(1);
}

try {
  if (command === 'help') {
    quickCommands[command]();
  } else {
    quickCommands[command](name);
  }
} catch (error) {
  console.error('❌ Error executing command:', error.message);
  process.exit(1);
} 