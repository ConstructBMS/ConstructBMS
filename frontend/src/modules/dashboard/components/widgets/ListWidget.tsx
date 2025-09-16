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
  id: string;
  title: string;
  description?: string;
  status?: string;
  date?: string;
  badge?: string;
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
          {items.map(item => (
            <div
              key={item.id}
              className='flex items-start justify-between p-3 rounded-lg border bg-card'
            >
              <div className='flex-1 min-w-0'>
                <div className='flex items-center space-x-2 mb-1'>
                  <h4 className='text-sm font-medium truncate'>{item.title}</h4>
                  {item.badge && (
                    <Badge variant='secondary' className='text-xs'>
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className='text-xs text-muted-foreground line-clamp-2'>
                    {item.description}
                  </p>
                )}
                {item.date && (
                  <p className='text-xs text-muted-foreground mt-1'>
                    {item.date}
                  </p>
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
