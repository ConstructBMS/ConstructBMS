import { AlertTriangle, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDemoModeStore } from '../app/store/demo-mode.store';

export function DemoModeBanner() {
  const { isDemoMode, canManageDemoData, getDemoModeStatus } =
    useDemoModeStore();
  const status = getDemoModeStatus();

  // Don't show banner if not in demo mode
  if (!isDemoMode) {
    return null;
  }

  return (
    <div
      className={`${status.statusColor} text-white py-2 px-4 text-sm font-medium`}
    >
      <div className='max-w-7xl mx-auto flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <AlertTriangle className='h-4 w-4' />
          <span>
            You are currently in <strong>Demo Mode</strong>. All data shown is
            for demonstration purposes only.
          </span>
        </div>

        <div className='flex items-center space-x-4'>
          {canManageDemoData && (
            <Link
              to='/settings?tab=general'
              className='flex items-center space-x-1 hover:bg-white/20 px-3 py-1 rounded transition-colors'
            >
              <Settings className='h-4 w-4' />
              <span>Go Live</span>
            </Link>
          )}

          <button
            onClick={() => {
              // Hide banner temporarily (could be stored in session storage)
              const banner = document.querySelector('[data-demo-banner]');
              if (banner) {
                banner.style.display = 'none';
              }
            }}
            className='hover:bg-white/20 p-1 rounded transition-colors'
            title='Dismiss banner'
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
