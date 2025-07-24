import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  FolderIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// Types
export interface Project {
  id: string;
  lastModified: Date;
  name: string;
  status: 'active' | 'archived' | 'draft';
}

export interface BreadcrumbItem {
  icon?: React.ComponentType<any>;
  id: string;
  label: string;
  path: string;
}

export interface AutosaveStatus {
  errorMessage?: string;
  lastSaved?: Date;
  status: 'saved' | 'saving' | 'error' | 'pending';
}

interface GanttHeaderProps {
  autosaveStatus: AutosaveStatus;
  breadcrumbs: BreadcrumbItem[];
  className?: string;
  currentProject: Project;
  onBreadcrumbClick?: (item: BreadcrumbItem) => void;
  onProfileAction?: (action: 'profile' | 'logout' | 'settings') => void;
  onProjectChange?: (projectId: string) => void;
}

const GanttHeader: React.FC<GanttHeaderProps> = ({
  currentProject,
  breadcrumbs,
  autosaveStatus,
  onProjectChange,
  onProfileAction,
  onBreadcrumbClick,
  className = ''
}) => {
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Mock projects data - replace with Supabase integration
  useEffect(() => {
    setAvailableProjects([
      currentProject,
      {
        id: '2',
        name: 'Office Building Renovation',
        status: 'active',
        lastModified: new Date(Date.now() - 3600000)
      },
      {
        id: '3',
        name: 'Shopping Center Construction',
        status: 'active',
        lastModified: new Date(Date.now() - 7200000)
      },
      {
        id: '4',
        name: 'Residential Complex Phase 1',
        status: 'draft',
        lastModified: new Date(Date.now() - 86400000)
      }
    ]);
  }, [currentProject]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format autosave status
  const formatAutosaveStatus = () => {
    switch (autosaveStatus.status) {
      case 'saved':
        return {
          text: `All changes saved at ${autosaveStatus.lastSaved?.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })}`,
          icon: CheckCircleIcon,
          color: 'text-green-500',
          bgColor: 'bg-green-50'
        };
      case 'saving':
        return {
          text: 'Saving changes...',
          icon: ClockIcon,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50'
        };
      case 'error':
        return {
          text: autosaveStatus.errorMessage || 'Save failed',
          icon: ExclamationTriangleIcon,
          color: 'text-red-500',
          bgColor: 'bg-red-50'
        };
      case 'pending':
        return {
          text: 'Changes pending...',
          icon: ClockIcon,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50'
        };
      default:
        return {
          text: 'Ready',
          icon: CheckCircleIcon,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const autosaveInfo = formatAutosaveStatus();
  const AutosaveIcon = autosaveInfo.icon;

  return (
    <header className={`
      bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
      border-b border-gray-700
      px-6 py-3
      flex items-center justify-between
      text-white
      ${className}
    `}>
      {/* Left Section - Project Name */}
      <div className="flex items-center space-x-4">
        <div className="relative" ref={projectDropdownRef}>
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <FolderIcon className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-white">{currentProject.name}</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>

          {/* Project Dropdown */}
          {showProjectDropdown && (
            <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Switch Project</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {availableProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      onProjectChange?.(project.id);
                      setShowProjectDropdown(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors
                      ${project.id === currentProject.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                    `}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <FolderIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{project.name}</span>
                        <span className={`
                          px-2 py-0.5 text-xs rounded-full
                          ${project.status === 'active' ? 'bg-green-100 text-green-800' : 
                            project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-gray-100 text-gray-800'}
                        `}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Last modified: {project.lastModified.toLocaleDateString()}
                      </p>
                    </div>
                    {project.id === currentProject.id && (
                      <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Breadcrumb Trail */}
      <div className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && (
              <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            )}
            <button
              onClick={() => onBreadcrumbClick?.(item)}
              className={`
                flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors
                ${index === breadcrumbs.length - 1 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }
              `}
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Right Section - User Profile & Autosave Status */}
      <div className="flex items-center space-x-4">
        {/* Autosave Status */}
        <div className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg
          ${autosaveInfo.bgColor}
        `}>
          <AutosaveIcon className={`w-4 h-4 ${autosaveInfo.color}`} />
          <span className={`text-sm font-medium ${autosaveInfo.color}`}>
            {autosaveInfo.text}
          </span>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">U</span>
            </div>
            <span className="font-medium text-white">User</span>
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileDropdown && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">User Name</p>
                <p className="text-xs text-gray-500">user@constructbms.com</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    onProfileAction?.('profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => {
                    onProfileAction?.('settings');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <CogIcon className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    onProfileAction?.('logout');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default GanttHeader; 