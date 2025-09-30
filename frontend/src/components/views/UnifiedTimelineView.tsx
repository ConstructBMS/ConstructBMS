import { Calendar, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'event' | 'milestone' | 'task' | 'note' | 'status-change';
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  metadata?: Record<string, unknown>;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
}

export interface UnifiedTimelineViewProps {
  items: TimelineItem[];
  onItemClick?: (item: TimelineItem) => void;
  onItemEdit?: (item: TimelineItem) => void;
  onItemDelete?: (item: TimelineItem) => void;
  renderItem?: (item: TimelineItem) => React.ReactNode;
  canEdit?: boolean;
  className?: string;
  groupBy?: 'day' | 'week' | 'month' | 'none';
}

export function UnifiedTimelineView({
  items,
  onItemClick,
  onItemEdit,
  onItemDelete,
  renderItem,
  canEdit = true,
  className = '',
  groupBy = 'day',
}: UnifiedTimelineViewProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'milestone':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'task':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'note':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'status-change':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in-progress':
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
      case 'closed':
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'planned':
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupItemsByDate = (items: TimelineItem[]) => {
    if (groupBy === 'none') {
      return { 'All Items': items };
    }

    const groups: Record<string, TimelineItem[]> = {};

    items.forEach(item => {
      const date = new Date(item.timestamp);
      let groupKey: string;

      switch (groupBy) {
        case 'day':
          groupKey = date.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          groupKey = `Week of ${weekStart.toLocaleDateString('en-GB', {
            month: 'short',
            day: 'numeric',
          })}`;
          break;
        case 'month':
          groupKey = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
          });
          break;
        default:
          groupKey = 'All Items';
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
    });

    // Sort items within each group by timestamp
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });

    return groups;
  };

  const defaultRenderItem = (item: TimelineItem) => (
    <Card className="mb-4 cursor-pointer hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              {item.title}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                {item.type.toUpperCase()}
              </Badge>
              {item.priority && (
                <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                  {item.priority.toUpperCase()}
                </Badge>
              )}
              {item.status && (
                <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                  {item.status}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(item.timestamp)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {item.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {item.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(item.timestamp)}</span>
          </div>

          {item.assignee && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{item.assignee}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {canEdit && (onItemEdit || onItemDelete || item.actions) && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
            {item.actions?.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant || 'ghost'}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                }}
                className="flex items-center gap-1"
              >
                {action.icon}
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}

            {onItemEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemEdit(item);
                }}
              >
                Edit
              </Button>
            )}

            {onItemDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onItemDelete(item);
                }}
              >
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const groupedItems = groupItemsByDate(items);

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedItems).map(([groupName, groupItems]) => (
        <div key={groupName}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px bg-border flex-1" />
            <h3 className="text-lg font-semibold text-muted-foreground">
              {groupName}
            </h3>
            <div className="h-px bg-border flex-1" />
          </div>
          <div className="space-y-4">
            {groupItems.map((item) => (
              <div key={item.id} onClick={() => onItemClick?.(item)}>
                {renderItem ? renderItem(item) : defaultRenderItem(item)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
