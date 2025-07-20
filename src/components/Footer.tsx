import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  DocumentDuplicateIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  PlusIcon,
  MinusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { persistentStorage } from '../services/persistentStorage';

interface FooterWidget {
  content: any;
  id: string;
  order: number;
  title: string;
  type: 'quick-actions' | 'contact-details' | 'page-links' | 'company-info' | 'social-links' | 'newsletter' | 'recent-activity' | 'quick-stats' | 'custom-text' | 'logo';
}

interface FooterSettings {
  accentColor: string;
  backgroundColor: string;
  columns: 1 | 2 | 3 | 4;
  customCss?: string;
  logoUrl?: string;
  showLogo: boolean;
  textColor: string;
  widgets: FooterWidget[];
}

interface FooterProps {
  onNavigateToModule?: (module: string, params?: Record<string, any>) => void;
}

const defaultFooterSettings: FooterSettings = {
  columns: 3,
  widgets: [
    {
      id: 'quick-actions',
      type: 'quick-actions',
      title: 'Quick Actions',
      content: {
        actions: [
          { label: 'New Project', module: 'projects', icon: 'BuildingOfficeIcon' },
          { label: 'Create Task', module: 'tasks', icon: 'ClipboardDocumentListIcon' },
          { label: 'Add Customer', module: 'customers', icon: 'UserGroupIcon' },
          { label: 'Schedule Meeting', module: 'calendar', icon: 'CalendarIcon' },
        ]
      },
      order: 1,
    },
    {
      id: 'contact-details',
      type: 'contact-details',
      title: 'Contact Details',
      content: {
        company: 'ConstructBMS Ltd',
        phone: '+44 20 7123 4567',
        email: 'info@constructbms.com',
        address: '123 Business Street, London, SW1 1AA',
        website: 'www.constructbms.com',
      },
      order: 2,
    },
    {
      id: 'page-links',
      type: 'page-links',
      title: 'Quick Links',
      content: {
        links: [
          { label: 'Roadmap', module: 'roadmap', icon: 'ChartBarIcon' },
          { label: 'Change Log', module: 'changelog', icon: 'DocumentTextIcon' },
          { label: 'Knowledge Base', module: 'help', icon: 'BookOpenIcon' },
          { label: 'Support', module: 'support', icon: 'QuestionMarkCircleIcon' },
        ]
      },
      order: 3,
    },
  ],
  backgroundColor: 'bg-constructbms-dark-2 dark:bg-constructbms-dark-2',
  textColor: 'text-gray-300',
  accentColor: 'text-constructbms-blue',
  showLogo: true,
  logoUrl: '/icons/icon.svg',
};

const Footer: React.FC<FooterProps> = ({ onNavigateToModule }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFooterSettings();
  }, []);

  const loadFooterSettings = async () => {
    try {
      const savedSettings = await persistentStorage.getSetting('footer_settings', 'ui');
      if (savedSettings) {
        setSettings({ ...defaultFooterSettings, ...savedSettings });
      }
    } catch (error) {
      console.warn('Failed to load footer settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFooterSettings = async (newSettings: FooterSettings) => {
    try {
      await persistentStorage.setSetting('footer_settings', newSettings, 'ui');
      setSettings(newSettings);
    } catch (error) {
      console.warn('Failed to save footer settings:', error);
    }
  };

  const getColumnClass = () => {
    switch (settings.columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  const renderWidget = (widget: FooterWidget) => {
    switch (widget.type) {
      case 'quick-actions':
        return (
          <div className="space-y-3">
            {widget.content.actions?.map((action: any, index: number) => (
              <button
                key={index}
                onClick={() => onNavigateToModule?.(action.module)}
                className="flex items-center space-x-2 text-sm hover:text-constructbms-blue transition-colors"
              >
                <span className="w-2 h-2 bg-constructbms-blue rounded-full"></span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        );

      case 'contact-details':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="h-4 w-4 text-constructbms-blue" />
              <span className="text-sm font-medium">{widget.content.company}</span>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-4 w-4 text-constructbms-blue" />
              <span className="text-sm">{widget.content.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-4 w-4 text-constructbms-blue" />
              <span className="text-sm">{widget.content.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4 text-constructbms-blue" />
              <span className="text-sm">{widget.content.address}</span>
            </div>
            <div className="flex items-center space-x-2">
              <GlobeAltIcon className="h-4 w-4 text-constructbms-blue" />
              <span className="text-sm">{widget.content.website}</span>
            </div>
          </div>
        );

      case 'page-links':
        return (
          <div className="space-y-3">
            {widget.content.links?.map((link: any, index: number) => (
              <button
                key={index}
                onClick={() => onNavigateToModule?.(link.module)}
                className="flex items-center space-x-2 text-sm hover:text-constructbms-blue transition-colors"
              >
                <span className="w-2 h-2 bg-constructbms-blue rounded-full"></span>
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        );

      case 'company-info':
        return (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">
              {widget.content.description || 'Leading fit-out contractor in London, delivering exceptional quality and innovative solutions for commercial spaces.'}
            </p>
            <div className="flex space-x-4">
              {widget.content.socialLinks?.map((social: any, index: number) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-constructbms-blue transition-colors"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        );

      case 'social-links':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-constructbms-blue">Follow Us</h4>
            <div className="flex space-x-4">
              {widget.content.platforms?.map((platform: any, index: number) => (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-constructbms-blue transition-colors"
                >
                  {platform.name}
                </a>
              ))}
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-constructbms-blue">Newsletter</h4>
            <p className="text-sm">{widget.content.description || 'Stay updated with our latest projects and industry insights.'}</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-constructbms-blue"
              />
              <button className="px-4 py-2 text-sm bg-constructbms-blue text-constructbms-dark-1 rounded-r-lg hover:bg-constructbms-accent-1 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        );

      case 'recent-activity':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-constructbms-blue">Recent Activity</h4>
            {widget.content.activities?.map((activity: any, index: number) => (
              <div key={index} className="text-sm">
                <span className="text-gray-400">{activity.time}</span>
                <p>{activity.description}</p>
              </div>
            ))}
          </div>
        );

      case 'quick-stats':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-constructbms-blue">Quick Stats</h4>
            <div className="grid grid-cols-2 gap-3">
              {widget.content.stats?.map((stat: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold text-constructbms-blue">{stat.value}</div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'custom-text':
        return (
          <div className="space-y-3">
            <h4 className="font-medium text-constructbms-blue">{widget.content.title || 'Custom Content'}</h4>
            <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: widget.content.html || widget.content.text || '' }} />
          </div>
        );

      case 'logo':
        return (
          <div className="space-y-3">
            {settings.showLogo && settings.logoUrl && (
              <img
                src={settings.logoUrl}
                alt="ConstructBMS"
                className="h-12 w-auto"
              />
            )}
            <p className="text-sm leading-relaxed">
              {widget.content.description || 'Building excellence in every project.'}
            </p>
          </div>
        );

      default:
        return <div className="text-sm text-gray-400">Unknown widget type</div>;
    }
  };

  if (isLoading) {
    return null;
  }

  const sortedWidgets = [...settings.widgets].sort((a, b) => a.order - b.order);

  return (
    <>
      <footer 
        className={`footer-root w-full ${settings.textColor} mt-auto bg-constructbms-dark-2 dark:bg-constructbms-dark-2`}
      >
        <div className="footer-inner w-full">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className={`grid ${getColumnClass()} gap-8`}>
              {sortedWidgets.map((widget) => (
                <div key={widget.id} className="space-y-4">
                  <h3 className="font-semibold text-constructbms-blue">{widget.title}</h3>
                  {renderWidget(widget)}
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <span className="text-sm">© 2024 ConstructBMS Ltd. All rights reserved.</span>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setShowSettings(true)}
                      className="text-sm text-gray-400 hover:text-constructbms-blue transition-colors flex items-center space-x-1"
                    >
                      <CogIcon className="h-4 w-4" />
                      <span>Footer Settings</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <a href="#" className="hover:text-constructbms-blue transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-constructbms-blue transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-constructbms-blue transition-colors">Cookie Policy</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Footer Settings Modal */}
      {showSettings && (
        <FooterSettingsModal
          settings={settings}
          onSave={saveFooterSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

// Footer Settings Modal Component
interface FooterSettingsModalProps {
  onClose: () => void;
  onSave: (settings: FooterSettings) => void;
  settings: FooterSettings;
}

const FooterSettingsModal: React.FC<FooterSettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = useState<FooterSettings>(settings);
  const [activeTab, setActiveTab] = useState<'layout' | 'widgets' | 'appearance'>('layout');

  const availableWidgets = [
    { id: 'quick-actions', name: 'Quick Actions', description: 'Common action buttons' },
    { id: 'contact-details', name: 'Contact Details', description: 'Company contact information' },
    { id: 'page-links', name: 'Page Links', description: 'Navigation links' },
    { id: 'company-info', name: 'Company Info', description: 'Company description and social links' },
    { id: 'social-links', name: 'Social Links', description: 'Social media links' },
    { id: 'newsletter', name: 'Newsletter', description: 'Email subscription form' },
    { id: 'recent-activity', name: 'Recent Activity', description: 'Latest system activities' },
    { id: 'quick-stats', name: 'Quick Stats', description: 'Key statistics' },
    { id: 'custom-text', name: 'Custom Text', description: 'Custom HTML content' },
    { id: 'logo', name: 'Logo', description: 'Company logo and tagline' },
  ];

  const handleAddWidget = (widgetType: string) => {
    const newWidget: FooterWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType as any,
      title: availableWidgets.find(w => w.id === widgetType)?.name || 'New Widget',
      content: {},
      order: localSettings.widgets.length + 1,
    };
    setLocalSettings({
      ...localSettings,
      widgets: [...localSettings.widgets, newWidget],
    });
  };

  const handleRemoveWidget = (widgetId: string) => {
    setLocalSettings({
      ...localSettings,
      widgets: localSettings.widgets.filter(w => w.id !== widgetId),
    });
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Footer Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-8 mb-6">
            {[
              { id: 'layout', name: 'Layout', icon: 'Grid' },
              { id: 'widgets', name: 'Widgets', icon: 'Puzzle' },
              { id: 'appearance', name: 'Appearance', icon: 'Palette' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Layout Tab */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Columns
                </label>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((cols) => (
                    <button
                      key={cols}
                      onClick={() => setLocalSettings({ ...localSettings, columns: cols as any })}
                      className={`p-4 border-2 rounded-lg text-center ${
                        localSettings.columns === cols
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-lg font-semibold">{cols}</div>
                      <div className="text-sm text-gray-500">Column{cols > 1 ? 's' : ''}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo Settings
                </label>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localSettings.showLogo}
                      onChange={(e) => setLocalSettings({ ...localSettings, showLogo: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Show logo in footer</span>
                  </label>
                  {localSettings.showLogo && (
                    <input
                      type="text"
                      placeholder="Logo URL"
                      value={localSettings.logoUrl || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, logoUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Widgets Tab */}
          {activeTab === 'widgets' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Current Widgets</h3>
                <div className="space-y-3">
                  {localSettings.widgets.map((widget, index) => (
                    <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">{widget.title}</span>
                        <span className="text-xs text-gray-500">{availableWidgets.find(w => w.id === widget.type)?.description}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRemoveWidget(widget.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add Widget</h3>
                <div className="grid grid-cols-2 gap-4">
                  {availableWidgets.map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => handleAddWidget(widget.id)}
                      className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-gray-400 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{widget.name}</div>
                      <div className="text-sm text-gray-500">{widget.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Background Color
                </label>
                <select
                  value={localSettings.backgroundColor}
                  onChange={(e) => setLocalSettings({ ...localSettings, backgroundColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bg-gray-900">Dark Gray</option>
                  <option value="bg-gray-800">Medium Gray</option>
                  <option value="bg-blue-900">Dark Blue</option>
                  <option value="bg-black">Black</option>
                  <option value="bg-white">White</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text Color
                </label>
                <select
                  value={localSettings.textColor}
                  onChange={(e) => setLocalSettings({ ...localSettings, textColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text-gray-300">Light Gray</option>
                  <option value="text-gray-400">Medium Gray</option>
                  <option value="text-white">White</option>
                  <option value="text-black">Black</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Accent Color
                </label>
                <select
                  value={localSettings.accentColor}
                  onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text-blue-400">Blue</option>
                  <option value="text-green-400">Green</option>
                  <option value="text-purple-400">Purple</option>
                  <option value="text-orange-400">Orange</option>
                  <option value="text-red-400">Red</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={localSettings.customCss || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, customCss: e.target.value })}
                  placeholder="Add custom CSS styles..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Footer; 
