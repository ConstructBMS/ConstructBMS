import {
  AlertTriangle,
  Database,
  DollarSign,
  FileText,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDemoModeStore } from '../../../app/store/demo-mode.store';
import { DeleteDemoDataModal } from '../../../components/modals/DeleteDemoDataModal';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  DemoDataService,
  DemoDataStats,
} from '../../../services/demo-data.service';

export function DemoDataManagement() {
  const [demoStats, setDemoStats] = useState<DemoDataStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isDemoMode, canManageDemoData, getDemoModeStatus } =
    useDemoModeStore();
  const status = getDemoModeStatus();

  useEffect(() => {
    loadDemoStats();
    checkPermissions();
  }, []);

  const loadDemoStats = async () => {
    try {
      setIsLoading(true);
      const stats = await DemoDataService.getDemoDataStats();
      setDemoStats(stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load demo data statistics'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const checkPermissions = async () => {
    try {
      const hasPermission = await DemoDataService.checkDemoDataPermissions();
      useDemoModeStore.getState().setCanManageDemoData(hasPermission);
    } catch (err) {
      console.error('Error checking permissions:', err);
    }
  };

  const handleDeleteSuccess = () => {
    // Refresh stats after deletion
    loadDemoStats();
  };

  if (!canManageDemoData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Database className='h-5 w-5' />
            <span>Demo Data Management</span>
          </CardTitle>
          <CardDescription>
            You don't have permission to manage demo data. Only administrators
            can perform this action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
            <p className='text-yellow-700 text-sm'>
              Contact your system administrator if you need to switch to live
              mode.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            <Database className='h-5 w-5' />
            <span>Demo Data Management</span>
            <Badge variant={status.isDemo ? 'default' : 'secondary'}>
              {status.statusText}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage demo data and switch between demo and live modes. Demo data
            is used for testing and demonstration purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Current Status */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-center space-x-2 mb-2'>
              <AlertTriangle className='h-4 w-4 text-blue-600' />
              <span className='font-medium text-blue-800'>Current Status</span>
            </div>
            <p className='text-blue-700 text-sm'>
              {isDemoMode
                ? 'The system is currently in demo mode. All data shown is for demonstration purposes only.'
                : 'The system is in live mode. All data is real and production-ready.'}
            </p>
          </div>

          {/* Demo Data Statistics */}
          {isDemoMode && (
            <div className='space-y-4'>
              <h4 className='font-medium'>Demo Data Statistics</h4>

              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                  <span className='ml-2 text-sm text-gray-600'>
                    Loading statistics...
                  </span>
                </div>
              ) : error ? (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <p className='text-red-700 text-sm'>{error}</p>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={loadDemoStats}
                    className='mt-2'
                  >
                    Retry
                  </Button>
                </div>
              ) : demoStats ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div className='bg-white border rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <Database className='h-4 w-4 text-blue-600' />
                      <span className='text-sm font-medium'>Total Records</span>
                    </div>
                    <div className='text-2xl font-bold text-blue-600'>
                      {demoStats.totalRecords.toLocaleString()}
                    </div>
                  </div>

                  <div className='bg-white border rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <FileText className='h-4 w-4 text-green-600' />
                      <span className='text-sm font-medium'>Projects</span>
                    </div>
                    <div className='text-2xl font-bold text-green-600'>
                      {demoStats.categories.projects}
                    </div>
                  </div>

                  <div className='bg-white border rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <Users className='h-4 w-4 text-purple-600' />
                      <span className='text-sm font-medium'>Contacts</span>
                    </div>
                    <div className='text-2xl font-bold text-purple-600'>
                      {demoStats.categories.contacts}
                    </div>
                  </div>

                  <div className='bg-white border rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-2'>
                      <DollarSign className='h-4 w-4 text-orange-600' />
                      <span className='text-sm font-medium'>Invoices</span>
                    </div>
                    <div className='text-2xl font-bold text-orange-600'>
                      {demoStats.categories.invoices}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Actions */}
          <div className='space-y-4'>
            <h4 className='font-medium'>Actions</h4>

            {isDemoMode ? (
              <div className='space-y-3'>
                <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <AlertTriangle className='h-4 w-4 text-red-600' />
                    <span className='font-medium text-red-800'>
                      Switch to Live Mode
                    </span>
                  </div>
                  <p className='text-red-700 text-sm mb-3'>
                    This will permanently delete all demo data and switch the
                    system to live mode. This action cannot be undone.
                  </p>
                  <Button
                    variant='destructive'
                    onClick={() => setIsDeleteModalOpen(true)}
                    className='flex items-center space-x-2'
                  >
                    <Trash2 className='h-4 w-4' />
                    <span>Delete Demo Data & Go Live</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <div className='flex items-center space-x-2 mb-2'>
                  <Database className='h-4 w-4 text-green-600' />
                  <span className='font-medium text-green-800'>
                    Live Mode Active
                  </span>
                </div>
                <p className='text-green-700 text-sm'>
                  The system is now in live mode. All data is real and
                  production-ready.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Demo Data Modal */}
      <DeleteDemoDataModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        demoStats={demoStats}
      />
    </div>
  );
}
