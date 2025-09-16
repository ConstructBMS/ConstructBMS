import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { DashboardWidget } from '../../store';

interface ListWidgetProps {
  widget: DashboardWidget;
}

interface ListItem {
  id?: string;
  label?: string;
  title?: string;
  description?: string;
  status?: string;
  date?: string;
  time?: string;
  badge?: string;
  icon?: string;
  color?: string;
  type?: string;
}

export function ListWidget({ widget }: ListWidgetProps) {
  const items = (widget.data?.items as ListItem[]) || [];

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='text-lg'>{widget.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-32 text-muted-foreground'>
            <p>No items available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>{widget.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className='flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors'
            >
              {item.icon && (
                <div className='flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm'>
                  {item.icon}
                </div>
              )}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-1'>
                  <h4 className='text-sm font-medium truncate'>
                    {item.label || item.title}
                  </h4>
                  {(item.time || item.date) && (
                    <span className='text-xs text-muted-foreground ml-2'>
                      {item.time || item.date}
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className='text-xs text-muted-foreground line-clamp-2'>
                    {item.description}
                  </p>
                )}
                {item.type && (
                  <div className='mt-2'>
                    <Badge 
                      variant='secondary' 
                      className={`text-xs ${item.color || 'bg-gray-100 text-gray-800'}`}
                    >
                      {item.type}
                    </Badge>
                  </div>
                )}
              </div>
              {item.status && (
                <div className='ml-2 flex-shrink-0'>
                  <Badge
                    variant={item.status === 'active' ? 'default' : 'secondary'}
                    className='text-xs'
                  >
                    {item.status}
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
