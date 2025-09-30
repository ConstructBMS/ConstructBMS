import { Clock, Grid3X3, Kanban, List } from 'lucide-react';
import { Button } from '../ui';

export type ViewMode = 'list' | 'grid' | 'kanban' | 'timeline';

export interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableViews?: ViewMode[];
  className?: string;
}

const viewConfig = {
  list: {
    icon: List,
    label: 'List',
    description: 'Table view with detailed information',
  },
  grid: {
    icon: Grid3X3,
    label: 'Grid',
    description: 'Card-based grid layout',
  },
  kanban: {
    icon: Kanban,
    label: 'Kanban',
    description: 'Drag-and-drop board view',
  },
  timeline: {
    icon: Clock,
    label: 'Timeline',
    description: 'Chronological timeline view',
  },
} as const;

export function ViewSwitcher({
  currentView,
  onViewChange,
  availableViews = ['list', 'grid', 'kanban', 'timeline'],
  className = '',
}: ViewSwitcherProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {availableViews.map(view => {
        const config = viewConfig[view];
        const Icon = config.icon;
        const isActive = currentView === view;

        return (
          <Button
            key={view}
            variant={isActive ? 'default' : 'ghost'}
            size='sm'
            onClick={() => onViewChange(view)}
            className='flex items-center gap-2'
            title={config.description}
          >
            <Icon className='h-4 w-4' />
            <span className='hidden sm:inline'>{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
