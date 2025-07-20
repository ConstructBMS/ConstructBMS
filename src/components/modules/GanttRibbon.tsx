import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDownIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  CogIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  UsersIcon,
  CalculatorIcon,
  ShoppingCartIcon,
  ChartPieIcon,
  ClockIcon,
  UserGroupIcon,
  KeyIcon,
  ShieldCheckIcon,
  HomeIcon,
  EyeIcon,
  FolderIcon,
  UserIcon,
  PaintBrushIcon,
  ArrowUpTrayIcon,
  WrenchScrewdriverIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid,
  MapIcon,
  TableCellsIcon,
  DocumentDuplicateIcon,
  FolderPlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  PrinterIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

// Types
export interface RibbonButton {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  type: 'button' | 'dropdown' | 'toggle' | 'split';
  action?: () => void;
  disabled?: boolean;
  tooltip?: string;
  dropdownItems?: RibbonDropdownItem[];
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export interface RibbonDropdownItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  action: () => void;
  disabled?: boolean;
  separator?: boolean;
}

export interface RibbonGroup {
  id: string;
  title: string;
  buttons: RibbonButton[];
  collapsed?: boolean;
}

export interface RibbonTab {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  groups: RibbonGroup[];
  disabled?: boolean;
}

interface GanttRibbonProps {
  tabs: RibbonTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onButtonClick?: (buttonId: string, tabId: string, groupId: string) => void;
  className?: string;
}

const GanttRibbon: React.FC<GanttRibbonProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onButtonClick,
  className = ''
}) => {
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(new Set());
  const [showOverflow, setShowOverflow] = useState(false);
  const ribbonRef = useRef<HTMLDivElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  // Handle dropdown toggle
  const toggleDropdown = (buttonId: string) => {
    setExpandedDropdowns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(buttonId)) {
        newSet.delete(buttonId);
      } else {
        newSet.add(buttonId);
      }
      return newSet;
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ribbonRef.current && !ribbonRef.current.contains(event.target as Node)) {
        setExpandedDropdowns(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle button click
  const handleButtonClick = (button: RibbonButton, tabId: string, groupId: string) => {
    if (button.disabled) return;

    switch (button.type) {
      case 'button':
        button.action?.();
        onButtonClick?.(button.id, tabId, groupId);
        break;
      case 'dropdown':
        toggleDropdown(button.id);
        break;
      case 'toggle':
        button.action?.();
        onButtonClick?.(button.id, tabId, groupId);
        break;
      case 'split':
        button.action?.();
        onButtonClick?.(button.id, tabId, groupId);
        break;
    }
  };

  // Render button based on type
  const renderButton = (button: RibbonButton, tabId: string, groupId: string) => {
    const ButtonIcon = button.icon;
    const isDropdownExpanded = expandedDropdowns.has(button.id);
    const isActive = button.isActive;

    const baseButtonClasses = `
      flex items-center justify-center px-3 py-2 rounded-lg transition-all duration-200
      ${button.disabled 
        ? 'text-gray-400 cursor-not-allowed' 
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
      }
      ${isActive ? 'bg-blue-100 text-blue-700 border border-blue-300' : ''}
    `;

    switch (button.type) {
      case 'button':
        return (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button, tabId, groupId)}
            disabled={button.disabled}
            className={baseButtonClasses}
            title={button.tooltip}
          >
            <ButtonIcon className="w-5 h-5" />
            {button.size !== 'small' && (
              <span className="ml-2 text-sm font-medium">{button.label}</span>
            )}
          </button>
        );

      case 'dropdown':
        return (
          <div key={button.id} className="relative">
            <button
              onClick={() => handleButtonClick(button, tabId, groupId)}
              disabled={button.disabled}
              className={`
                ${baseButtonClasses} flex items-center
                ${isDropdownExpanded ? 'bg-gray-100' : ''}
              `}
              title={button.tooltip}
            >
              <ButtonIcon className="w-5 h-5" />
              {button.size !== 'small' && (
                <span className="ml-2 text-sm font-medium">{button.label}</span>
              )}
              <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownExpanded && button.dropdownItems && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="py-1">
                  {button.dropdownItems.map((item) => (
                    <React.Fragment key={item.id}>
                      {item.separator ? (
                        <div className="border-t border-gray-200 my-1"></div>
                      ) : (
                        <button
                          onClick={() => {
                            item.action();
                            setExpandedDropdowns(new Set());
                          }}
                          disabled={item.disabled}
                          className={`
                            w-full flex items-center px-4 py-2 text-left text-sm transition-colors
                            ${item.disabled 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                          <span>{item.label}</span>
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'toggle':
        return (
          <button
            key={button.id}
            onClick={() => handleButtonClick(button, tabId, groupId)}
            disabled={button.disabled}
            className={`
              ${baseButtonClasses} flex items-center
              ${isActive ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
            `}
            title={button.tooltip}
          >
            <ButtonIcon className="w-5 h-5" />
            {button.size !== 'small' && (
              <span className="ml-2 text-sm font-medium">{button.label}</span>
            )}
          </button>
        );

      case 'split':
        return (
          <div key={button.id} className="flex">
            <button
              onClick={() => handleButtonClick(button, tabId, groupId)}
              disabled={button.disabled}
              className={`
                ${baseButtonClasses} rounded-r-none border-r border-gray-300
              `}
              title={button.tooltip}
            >
              <ButtonIcon className="w-5 h-5" />
              {button.size !== 'small' && (
                <span className="ml-2 text-sm font-medium">{button.label}</span>
              )}
            </button>
            <button
              onClick={() => toggleDropdown(button.id)}
              disabled={button.disabled}
              className={`
                ${baseButtonClasses} rounded-l-none px-2
                ${isDropdownExpanded ? 'bg-gray-100' : ''}
              `}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Render ribbon group
  const renderGroup = (group: RibbonGroup, tabId: string) => (
    <div key={group.id} className="flex flex-col">
      <div className="px-3 py-1">
        <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
          {group.title}
        </h3>
      </div>
      <div className="flex flex-wrap gap-1 px-2 pb-2">
        {group.buttons.map(button => renderButton(button, tabId, group.id))}
      </div>
    </div>
  );

  // Get active tab
  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div ref={ribbonRef} className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Tab Bar */}
      <div className="flex items-center bg-gray-50 border-b border-gray-200">
        <div className="flex-1 flex items-center overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.id === activeTab;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                disabled={tab.disabled}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium transition-all duration-200
                  ${tab.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
                  }
                  ${isActive 
                    ? 'text-blue-700 bg-white border-b-2 border-blue-600' 
                    : ''
                  }
                `}
              >
                {TabIcon && <TabIcon className="w-4 h-4 mr-2" />}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Overflow Menu */}
        <div className="relative" ref={overflowRef}>
          <button
            onClick={() => setShowOverflow(!showOverflow)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>

          {showOverflow && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="py-1">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setShowOverflow(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {TabIcon && <TabIcon className="w-4 h-4 mr-3" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ribbon Content */}
      {activeTabData && (
        <div className="flex items-start p-2 gap-4 overflow-x-auto">
          {activeTabData.groups.map(group => renderGroup(group, activeTabData.id))}
        </div>
      )}
    </div>
  );
};

export default GanttRibbon; 