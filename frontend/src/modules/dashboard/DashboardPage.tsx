import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Page } from '../../components/layout/Page';
import { Button } from '../../components/ui/button';
import { CreateDashboardDialog } from './components/CreateDashboardDialog';
import { DashboardWidgets } from './components/DashboardWidgets';
import { useDashboardStore } from './store';

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { dashboards, activeDashboardId, setActiveDashboard } =
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


  return (
    <Page title='Dashboard'>
      <div className='w-full'>
        {/* Tab Navigation */}
        <div className='flex items-center justify-between mb-8'>
          <div className='flex items-center space-x-6'>
            {dashboards.map(dashboard => (
              <div key={dashboard.id} className='flex items-center space-x-2'>
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
              </div>
            ))}
          </div>

          {/* Add New Dashboard Button */}
          <CreateDashboardDialog>
            <Button
              variant='outline'
              size='sm'
              className='bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
            >
              <Plus className='h-4 w-4 mr-2' />
              Add Dashboard
            </Button>
          </CreateDashboardDialog>
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
