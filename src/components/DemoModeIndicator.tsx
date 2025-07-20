import React from 'react';
import { Info, X, Trash2 } from 'lucide-react';

interface DemoModeIndicatorProps {
  isDemoMode: boolean;
  onNavigateToSettings?: () => void;
}

const DemoModeIndicator: React.FC<DemoModeIndicatorProps> = ({ isDemoMode, onNavigateToSettings }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isDemoMode || !isVisible) {
    return null;
  }

  const handleSettingsClick = () => {
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  return (
            <div className="bg-constructbms-blue text-black px-4 py-2 flex items-center justify-between text-sm font-medium">
      <div className="flex items-center gap-2">
        <Info className="h-4 w-4" />
        <span>Demo Mode - All data is for demonstration purposes only</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSettingsClick}
          className="flex items-center gap-1 hover:bg-black/20 rounded px-3 py-1 transition-colors border border-black/20 hover:border-black/40"
          title="Go to Data & Backup Settings to clear demo data"
        >
          <Trash2 className="h-3 w-3" />
          <span className="text-xs font-medium">Clear Demo Data</span>
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="hover:bg-black/10 rounded p-1 transition-colors"
          title="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default DemoModeIndicator; 
