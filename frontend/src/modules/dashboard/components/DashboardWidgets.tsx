import { Dashboard, DashboardWidget } from '../store';
import { ChartWidget } from './widgets/ChartWidget';
import { CustomWidget } from './widgets/CustomWidget';
import { ListWidget } from './widgets/ListWidget';
import { StatsWidget } from './widgets/StatsWidget';
import { TableWidget } from './widgets/TableWidget';

interface DashboardWidgetsProps {
  dashboard: Dashboard;
}

export function DashboardWidgets({ dashboard }: DashboardWidgetsProps) {
  if (!dashboard.widgets || dashboard.widgets.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-center'>
        <div className='rounded-full bg-muted p-6 mb-4'>
          <svg
            className='h-12 w-12 text-muted-foreground'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          </svg>
        </div>
        <h3 className='text-lg font-semibold text-foreground mb-2'>
          No widgets yet
        </h3>
        <p className='text-muted-foreground max-w-sm'>
          This dashboard is empty. Add some widgets to get started with your
          dashboard.
        </p>
      </div>
    );
  }

  // Special layout for financial dashboard
  if (dashboard.id === 'financial-dashboard') {
    return (
      <div className='space-y-6'>
        {/* Row 1: Financial Overview - Full width */}
        <div className='grid grid-cols-1'>
          {dashboard.widgets
            .filter(widget => widget.id === 'financial-overview')
            .map(widget => (
              <div key={widget.id} className='h-full'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
        </div>

        {/* Row 2: Revenue Trend, Expense Breakdown, Cash Flow - 3 equal columns */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Revenue Trend (6 Months) */}
          {dashboard.widgets
            .filter(widget => widget.id === 'revenue-chart')
            .map(widget => (
              <div key={widget.id} className='h-96'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
          
          {/* Expense Breakdown */}
          {dashboard.widgets
            .filter(widget => widget.id === 'expense-breakdown')
            .map(widget => (
              <div key={widget.id} className='h-96'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
          
          {/* Cash Flow Projection */}
          {dashboard.widgets
            .filter(widget => widget.id === 'cash-flow')
            .map(widget => (
              <div key={widget.id} className='h-96'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
        </div>

        {/* Row 3: Outstanding Invoices and Project Profitability - 2 equal columns */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {dashboard.widgets
            .filter(
              widget =>
                widget.id === 'outstanding-invoices' ||
                widget.id === 'project-profitability'
            )
            .map(widget => (
              <div key={widget.id} className='h-96'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
        </div>

        {/* Row 4: Financial Quick Actions - Full width */}
        <div className='grid grid-cols-1'>
          {dashboard.widgets
            .filter(widget => widget.id === 'financial-actions')
            .map(widget => (
              <div key={widget.id} className='h-full'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Special layout for home dashboard
  if (dashboard.id === 'default-dashboard') {
    return (
      <div className='space-y-6'>
        {/* Row 1: Welcome, Project Status, Performance Metrics - 3 equal columns */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Welcome Widget */}
          {dashboard.widgets
            .filter(widget => widget.id === 'welcome-widget')
            .map(widget => (
              <div key={widget.id} className='h-full'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}

          {/* Project Status Distribution */}
          {dashboard.widgets
            .filter(widget => widget.id === 'project-status')
            .map(widget => (
              <div key={widget.id} className='h-96'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}

          {/* Performance Metrics */}
          {dashboard.widgets
            .filter(widget => widget.id === 'performance-metrics')
            .map(widget => (
              <div key={widget.id} className='h-96'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
        </div>

        {/* Row 2: Business Overview - Full width */}
        <div className='grid grid-cols-1'>
          {dashboard.widgets
            .filter(widget => widget.id === 'business-overview')
            .map(widget => (
              <div key={widget.id} className='h-full'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
        </div>

        {/* Row 3: Recent Activities and Upcoming Deadlines - 2 equal columns */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {dashboard.widgets
            .filter(
              widget =>
                widget.id === 'recent-activities' ||
                widget.id === 'upcoming-deadlines'
            )
            .map(widget => (
              <div key={widget.id} className='h-96'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
        </div>

        {/* Row 4: Quick Actions - Full width */}
        <div className='grid grid-cols-1'>
          {dashboard.widgets
            .filter(widget => widget.id === 'quick-actions')
            .map(widget => (
              <div key={widget.id} className='h-full'>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Default layout for other dashboards
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {dashboard.widgets.map(widget => {
        // Make certain widgets span multiple columns for landscape layout
        const isWideWidget =
          widget.type === 'stats' ||
          widget.type === 'table' ||
          widget.type === 'list';
        const colSpan = isWideWidget ? 'md:col-span-2 lg:col-span-3' : '';

        return (
          <div key={widget.id} className={colSpan}>
            <WidgetRenderer widget={widget} />
          </div>
        );
      })}
    </div>
  );
}

interface WidgetRendererProps {
  widget: DashboardWidget;
}

function WidgetRenderer({ widget }: WidgetRendererProps) {
  switch (widget.type) {
    case 'stats':
      return <StatsWidget widget={widget} />;
    case 'table':
      return <TableWidget widget={widget} />;
    case 'list':
      return <ListWidget widget={widget} />;
    case 'custom':
      return <CustomWidget widget={widget} />;
    case 'chart':
      return <ChartWidget widget={widget} />;
    default:
      return (
        <div className='bg-card border rounded-lg p-6'>
          <h3 className='text-lg font-semibold mb-4'>{widget.title}</h3>
          <div className='flex items-center justify-center h-32 text-muted-foreground'>
            <p>Unknown widget type</p>
          </div>
        </div>
      );
  }
}
