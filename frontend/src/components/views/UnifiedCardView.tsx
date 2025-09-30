import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui';

export interface CardItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  dueDate?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }>;
}

export interface UnifiedCardViewProps {
  items: CardItem[];
  onItemClick?: (item: CardItem) => void;
  onItemEdit?: (item: CardItem) => void;
  onItemDelete?: (item: CardItem) => void;
  renderItem?: (item: CardItem) => React.ReactNode;
  canEdit?: boolean;
  className?: string;
}

export function UnifiedCardView({
  items,
  onItemClick,
  onItemEdit,
  onItemDelete,
  renderItem,
  canEdit = true,
  className = '',
}: UnifiedCardViewProps) {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      case 'closed-lost':
        return 'bg-red-100 text-red-800';
      case 'planned':
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const defaultRenderItem = (item: CardItem) => (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
      onClick={() => onItemClick?.(item)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {item.title}
          </CardTitle>
          <div className="flex items-center gap-2 ml-2">
            {item.priority && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getPriorityColor(item.priority)}`}
              >
                {item.priority.toUpperCase()}
              </Badge>
            )}
            {item.status && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(item.status)}`}
              >
                {item.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {item.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
            {item.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {item.assignee && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">👤</span>
              <span>{item.assignee}</span>
            </div>
          )}
          
          {item.dueDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">📅</span>
              <span>{formatDate(item.dueDate)}</span>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.tags.length - 3} more
                </Badge>
              )}
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

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {items.map((item) => (
        <div key={item.id}>
          {renderItem ? renderItem(item) : defaultRenderItem(item)}
        </div>
      ))}
    </div>
  );
}
