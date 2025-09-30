import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export interface ListColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, item: ListItem) => React.ReactNode;
}

export interface ListItem {
  id: string;
  [key: string]: unknown;
}

export interface UnifiedListViewProps {
  items: ListItem[];
  columns: ListColumn[];
  onItemClick?: (item: ListItem) => void;
  onItemEdit?: (item: ListItem) => void;
  onItemDelete?: (item: ListItem) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  canEdit?: boolean;
  className?: string;
  emptyMessage?: string;
}

export function UnifiedListView({
  items,
  columns,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onSort,
  canEdit = true,
  className = '',
  emptyMessage = 'No items found',
}: UnifiedListViewProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (!onSort) return;

    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
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
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const renderCellValue = (column: ListColumn, item: ListItem) => {
    const value = item[column.key];

    if (column.render) {
      return column.render(value, item);
    }

    // Default rendering based on value type
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    if (typeof value === 'number') {
      if (column.key.toLowerCase().includes('budget') || column.key.toLowerCase().includes('value') || column.key.toLowerCase().includes('amount')) {
        return formatCurrency(value);
      }
      return value.toLocaleString();
    }

    if (typeof value === 'string' && value.includes('T') && !isNaN(Date.parse(value))) {
      return formatDate(value);
    }

    if (column.key.toLowerCase().includes('priority')) {
      return (
        <Badge className={getPriorityColor(value as string)}>
          {(value as string)?.toUpperCase() || 'N/A'}
        </Badge>
      );
    }

    if (column.key.toLowerCase().includes('status')) {
      return (
        <Badge className={getStatusColor(value as string)}>
          {value as string || 'N/A'}
        </Badge>
      );
    }

    return value as string || 'N/A';
  };

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={column.width ? `w-[${column.width}]` : ''}
              >
                <div className="flex items-center gap-2">
                  <span>{column.label}</span>
                  {column.sortable && onSort && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort(column.key)}
                      className="h-6 w-6 p-0"
                    >
                      {sortColumn === column.key ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </TableHead>
            ))}
            {canEdit && (onItemEdit || onItemDelete) && (
              <TableHead className="w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onItemClick?.(item)}
            >
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {renderCellValue(column, item)}
                </TableCell>
              ))}
              {canEdit && (onItemEdit || onItemDelete) && (
                <TableCell>
                  <div className="flex items-center gap-2">
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
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
