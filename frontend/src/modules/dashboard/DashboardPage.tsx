import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Page } from '../../components/layout/Page';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { CreateDashboardDialog } from './components/CreateDashboardDialog';
import { DashboardWidgets } from './components/DashboardWidgets';
import { useDashboardStore } from './store';

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [editingDashboard, setEditingDashboard] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const { dashboards, activeDashboardId, setActiveDashboard, updateDashboard, deleteDashboard } =
    useDashboardStore();

  // const activeDashboard = dashboards.find(d => d.id === activeDashboardId);

  // URL to dashboard ID mapping
  const urlToDashboardId: Record<string, string> = {
    '/dashboard': 'default-dashboard',
    '/dashboard-home': 'default-dashboard',
    '/dashboard-financial': 'financial-dashboard',
  };

  // Dashboard ID to URL mapping
  const dashboardIdToUrl: Record<string, string> = {
    'default-dashboard': '/dashboard-home',
    'financial-dashboard': '/dashboard-financial',
  };

  // Sync URL with active dashboard
  useEffect(() => {
    const currentPath = location.pathname;
    const targetDashboardId = urlToDashboardId[currentPath];

    if (targetDashboardId && targetDashboardId !== activeDashboardId) {
      setActiveDashboard(targetDashboardId);
    }
  }, [location.pathname, setActiveDashboard]);

  const handleDashboardSelect = (dashboardId: string) => {
    setActiveDashboard(dashboardId);

    // Update URL to match selected dashboard
    const targetUrl = dashboardIdToUrl[dashboardId];
    if (targetUrl && targetUrl !== location.pathname) {
      navigate(targetUrl);
    }
  };

  const handleEditStart = (dashboardId: string, currentName: string) => {
    setEditingDashboard(dashboardId);
    setEditName(currentName);
  };

  const handleEditSave = (dashboardId: string) => {
    if (editName.trim()) {
      updateDashboard(dashboardId, { name: editName.trim() });
    }
    setEditingDashboard(null);
    setEditName('');
  };

  const handleEditCancel = () => {
    setEditingDashboard(null);
    setEditName('');
  };

  const handleDeleteDashboard = (dashboardId: string) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      deleteDashboard(dashboardId);
      // Navigate to default dashboard if the active one is deleted
      if (activeDashboardId === dashboardId) {
        navigate('/dashboard-home');
      }
    }
  };

  return (
    <Page title='Dashboard'>
      <div className='w-full'>
        {/* Tab Navigation */}
        <div className='flex items-center justify-center mb-8'>
          <div className='flex items-center space-x-6'>
            {dashboards.map(dashboard => (
              <div key={dashboard.id} className='flex items-center space-x-2 group'>
                {editingDashboard === dashboard.id ? (
                  <div className='flex items-center space-x-1'>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className='h-8 text-sm'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(dashboard.id);
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      autoFocus
                    />
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleEditSave(dashboard.id)}
                      className='h-8 w-8 p-0'
                    >
                      <Check className='h-3 w-3' />
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={handleEditCancel}
                      className='h-8 w-8 p-0'
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                ) : (
                  <div className='flex items-center space-x-1'>
                    <button
                      onClick={() => handleDashboardSelect(dashboard.id)}
                      className={`
                        relative px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out
                        ${
                          activeDashboardId === dashboard.id
                            ? 'text-foreground border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground/50'
                        }
                        border-b-2 border-transparent
                      `}
                    >
                      {dashboard.name}
                    </button>
                    {!dashboard.isDefault && (
                      <div className='flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleEditStart(dashboard.id, dashboard.name)}
                          className='h-6 w-6 p-0'
                        >
                          <Edit2 className='h-3 w-3' />
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleDeleteDashboard(dashboard.id)}
                          className='h-6 w-6 p-0 text-destructive hover:text-destructive'
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Add New Dashboard Tab */}
            <CreateDashboardDialog>
              <button className='relative px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-muted-foreground/50 border-b-2 border-transparent'>
                <Plus className='h-4 w-4 inline mr-1' />
                Add Dashboard
              </button>
            </CreateDashboardDialog>
          </div>
        </div>

        {/* Dashboard Content with Animation */}
        <div className='relative min-h-[400px]'>
          {dashboards.map(dashboard => (
            <div
              key={dashboard.id}
              className={`
                transition-all duration-300 ease-in-out
                ${
                  activeDashboardId === dashboard.id
                    ? 'opacity-100 translate-y-0 block'
                    : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
                }
              `}
            >
              {activeDashboardId === dashboard.id && (
                <div className='animate-in fade-in-0 slide-in-from-bottom-4 duration-300'>
                  <DashboardWidgets dashboard={dashboard} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
