import { Calendar, Clock, Edit, Trash2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui';
import { Separator } from '../ui/separator';

export interface DetailField {
  label: string;
  value: string | number | boolean | null | undefined;
  type?: 'text' | 'email' | 'phone' | 'url' | 'date' | 'currency' | 'boolean' | 'badge';
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  badgeColor?: string;
}

export interface DetailSection {
  title: string;
  fields: DetailField[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface DetailAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  disabled?: boolean;
}

export interface UnifiedDetailViewProps {
  title: string;
  subtitle?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  sections: DetailSection[];
  actions?: DetailAction[];
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  className?: string;
  headerImage?: string;
  headerIcon?: React.ReactNode;
}

export function UnifiedDetailView({
  title,
  subtitle,
  status,
  priority,
  sections,
  actions = [],
  onEdit,
  onDelete,
  canEdit = true,
  className = '',
  headerImage,
  headerIcon,
}: UnifiedDetailViewProps) {
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
        return 'bg-red-100 text-red-800';
      case 'planned':
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatValue = (field: DetailField) => {
    const { value, type = 'text' } = field;

    if (value === null || value === undefined) {
      return 'N/A';
    }

    switch (type) {
      case 'email':
        return (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
            {value as string}
          </a>
        );
      case 'phone':
        return (
          <a href={`tel:${value}`} className="text-blue-600 hover:underline">
            {value as string}
          </a>
        );
      case 'url':
        return (
          <a
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {value as string}
          </a>
        );
      case 'date':
        return new Date(value as string).toLocaleDateString('en-GB');
      case 'currency':
        return new Intl.NumberFormat('en-GB', {
          style: 'currency',
          currency: 'GBP',
        }).format(value as number);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'badge':
        return (
          <Badge
            variant={field.badgeVariant || 'secondary'}
            className={field.badgeColor}
          >
            {value as string}
          </Badge>
        );
      default:
        return value as string;
    }
  };

  const renderSection = (section: DetailSection, index: number) => (
    <Card key={index} className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{section.title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.fields.map((field, fieldIndex) => (
            <div key={fieldIndex} className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                {field.label}
              </label>
              <div className="text-sm">
                {formatValue(field)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {headerImage && (
                <img
                  src={headerImage}
                  alt={title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              {headerIcon && !headerImage && (
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  {headerIcon}
                </div>
              )}
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold mb-2">{title}</CardTitle>
                {subtitle && (
                  <p className="text-muted-foreground mb-3">{subtitle}</p>
                )}
                <div className="flex items-center gap-2">
                  {priority && (
                    <Badge className={getPriorityColor(priority)}>
                      {priority.toUpperCase()}
                    </Badge>
                  )}
                  {status && (
                    <Badge className={getStatusColor(status)}>
                      {status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {canEdit && (onEdit || onDelete || actions.length > 0) && (
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDelete}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => renderSection(section, index))}
      </div>
    </div>
  );
}
