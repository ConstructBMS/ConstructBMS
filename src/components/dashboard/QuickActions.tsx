import React from 'react';
import {
  Plus,
  FileText,
  Users,
  Mail,
  Calendar,
  PoundSterling,
} from 'lucide-react';

interface QuickActionsProps {
  onNavigateToModule?: (module: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNavigateToModule }) => {
  const handleAction = (action: string) => {
    switch (action) {
      case 'New Project':
        if (onNavigateToModule) {
          onNavigateToModule('projects');
        } else {
          alert('New Project action triggered!');
        }
        break;
      case 'Create Estimate':
        if (onNavigateToModule) {
          onNavigateToModule('estimating');
        } else {
          alert('Create Estimate action triggered!');
        }
        break;
      case 'Add Client':
        if (onNavigateToModule) {
          onNavigateToModule('customers');
        } else {
          alert('Add Client action triggered!');
        }
        break;
      case 'Send Invoice':
        if (onNavigateToModule) {
          onNavigateToModule('finance');
        } else {
          alert('Send Invoice action triggered!');
        }
        break;
      case 'Schedule Meeting':
        if (onNavigateToModule) {
          onNavigateToModule('calendar');
        } else {
          alert('Schedule Meeting action triggered!');
        }
        break;
      case 'Compose Email':
        if (onNavigateToModule) {
          onNavigateToModule('email');
        } else {
          alert('Compose Email action triggered!');
        }
        break;
      default:
        alert(`${action} action triggered!`);
    }
  };

  const actions = [
    {
      name: 'New Project',
      icon: Plus,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      hoverBg: 'hover:bg-blue-100',
    },
    {
      name: 'Create Estimate',
      icon: FileText,
      color: 'green',
      bgColor: 'bg-archer-green/10',
      textColor: 'text-archer-green',
      hoverBg: 'hover:bg-archer-green/20',
    },
    {
      name: 'Add Client',
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      hoverBg: 'hover:bg-purple-100',
    },
    {
      name: 'Send Invoice',
      icon: PoundSterling,
      color: 'orange',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      hoverBg: 'hover:bg-orange-100',
    },
    {
      name: 'Schedule Meeting',
      icon: Calendar,
      color: 'indigo',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      hoverBg: 'hover:bg-indigo-100',
    },
    {
      name: 'Compose Email',
      icon: Mail,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      hoverBg: 'hover:bg-red-100',
    },
  ];

  return (
    <div className='bg-white rounded-xl p-6 shadow-sm border border-gray-100'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Quick Actions
      </h3>
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {actions.map(action => (
          <button
            key={action.name}
            onClick={() => handleAction(action.name)}
            className={`flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 ${action.bgColor} ${action.hoverBg} hover:border-archer-neon transition-all duration-200 group`}
          >
            <action.icon
              className={`h-6 w-6 ${action.textColor} mb-2 group-hover:scale-110 group-hover:text-archer-neon transition-all duration-200`}
            />
            <span
              className={`text-sm font-medium ${action.textColor} group-hover:text-archer-neon`}
            >
              {action.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
