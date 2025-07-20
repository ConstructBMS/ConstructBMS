import React, { useState } from 'react';
import GanttSidebar from './GanttSidebar';
import type { UserRole } from './GanttSidebar';

const GanttSidebarDemo: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('project_manager');

  const roles: UserRole[] = [
    'super_admin',
    'project_manager', 
    'scheduler',
    'estimator',
    'procurement',
    'viewer'
  ];

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    console.log(`Switched to section: ${section}`);
  };

  const handleToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <GanttSidebar
        collapsed={collapsed}
        onToggle={handleToggle}
        activeSection={activeSection}
        userRole={userRole}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gantt Module Demo</h1>
              <p className="text-sm text-gray-600">
                Current Role: <span className="font-medium">{userRole.replace('_', ' ')}</span> | 
                Active Section: <span className="font-medium">{activeSection}</span>
              </p>
            </div>
            
            {/* Role Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">User Role:</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as UserRole)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {activeSection.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Content
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Sidebar Features</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Role-based menu filtering</li>
                  <li>• Collapsible sidebar with smooth animations</li>
                  <li>• Hierarchical menu items with expand/collapse</li>
                  <li>• Active section highlighting</li>
                  <li>• User preferences persistence (via Supabase)</li>
                  <li>• Responsive design</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-2">Current State</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Sidebar Width:</strong> {collapsed ? '64px (collapsed)' : '256px (expanded)'}</p>
                  <p><strong>User Role:</strong> {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                  <p><strong>Active Section:</strong> {activeSection}</p>
                  <p><strong>Available Sections:</strong> Varies by role</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">Role Permissions</h3>
                <div className="text-sm text-yellow-800">
                  <p><strong>Super Admin:</strong> All sections + Reports, User Management, Settings</p>
                  <p><strong>Project Manager:</strong> Dashboard, Gantt Planner, Calendar, Clients, Estimates, Procurement</p>
                  <p><strong>Scheduler:</strong> Dashboard, Gantt Planner, Calendar</p>
                  <p><strong>Estimator:</strong> Dashboard, Estimates</p>
                  <p><strong>Procurement:</strong> Dashboard, Procurement</p>
                  <p><strong>Viewer:</strong> Dashboard, Calendar, Clients</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-medium text-purple-900 mb-2">Integration Notes</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Sidebar integrates with Supabase for dynamic configuration</li>
                  <li>• User preferences are persisted automatically</li>
                  <li>• Role-based access control is enforced</li>
                  <li>• Supports custom sidebar configurations</li>
                  <li>• Ready for integration with routing system</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GanttSidebarDemo; 