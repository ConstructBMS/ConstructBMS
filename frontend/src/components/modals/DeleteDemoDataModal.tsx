import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useDemoModeStore } from '../../app/store/demo-mode.store';
import {
  DemoDataService,
  DemoDataStats,
} from '../../services/demo-data.service';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface DeleteDemoDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  demoStats?: DemoDataStats;
}

export function DeleteDemoDataModal({
  isOpen,
  onClose,
  onSuccess,
  demoStats,
}: DeleteDemoDataModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { clearDemoData } = useDemoModeStore();

  const requiredConfirmText = 'DELETE DEMO DATA';
  const isConfirmValid = confirmText === requiredConfirmText;

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    setIsDeleting(true);
    setError(null);

    try {
      await DemoDataService.deleteAllDemoData();
      clearDemoData();
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete demo data'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center space-x-2 text-red-600'>
            <AlertTriangle className='h-5 w-5' />
            <span>Delete Demo Data</span>
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete all demo data and switch the
            system to live mode. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {demoStats && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <h4 className='font-medium text-yellow-800 mb-2'>
                Demo Data Summary
              </h4>
              <div className='grid grid-cols-2 gap-2 text-sm text-yellow-700'>
                <div>
                  Total Records: {demoStats.totalRecords.toLocaleString()}
                </div>
                <div>Projects: {demoStats.categories.projects}</div>
                <div>Contacts: {demoStats.categories.contacts}</div>
                <div>Tasks: {demoStats.categories.tasks}</div>
                <div>Invoices: {demoStats.categories.invoices}</div>
                <div>Expenses: {demoStats.categories.expenses}</div>
                <div>Users: {demoStats.categories.users}</div>
                <div>Documents: {demoStats.categories.documents}</div>
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <label className='text-sm font-medium'>
              To confirm, type{' '}
              <code className='bg-gray-100 px-1 rounded'>
                {requiredConfirmText}
              </code>
              :
            </label>
            <input
              type='text'
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
              placeholder={requiredConfirmText}
              disabled={isDeleting}
            />
          </div>

          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <p className='text-red-700 text-sm'>{error}</p>
            </div>
          )}

          <div className='flex justify-end space-x-3'>
            <Button
              variant='outline'
              onClick={handleClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant='destructive'
              onClick={handleDelete}
              disabled={!isConfirmValid || isDeleting}
              className='flex items-center space-x-2'
            >
              {isDeleting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className='h-4 w-4' />
                  <span>Delete Demo Data</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
