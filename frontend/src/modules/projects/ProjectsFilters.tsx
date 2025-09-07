import { X } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui';
import type { ProjectFilters, ProjectStatus } from '../../lib/types/projects';
import { useContactsStore } from '../contacts/store';

interface ProjectsFiltersProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  onClose: () => void;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function ProjectsFilters({
  filters,
  onFiltersChange,
  onClose,
}: ProjectsFiltersProps) {
  const { contacts, companies } = useContactsStore();
  const handleStatusChange = (statuses: string[]) => {
    onFiltersChange({
      ...filters,
      status: statuses.length > 0 ? (statuses as ProjectStatus[]) : undefined,
    });
  };

  const handleClientChange = (clientId: string) => {
    onFiltersChange({
      ...filters,
      clientId: clientId || undefined,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      clientId: undefined,
      tags: [],
    });
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof ProjectFilters];
    return (
      value !== undefined &&
      value !== null &&
      (Array.isArray(value) ? value.length > 0 : true)
    );
  });

  return (
    <Card>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Filters</CardTitle>
          <div className='flex items-center gap-2'>
            {hasActiveFilters && (
              <Button variant='ghost' size='sm' onClick={handleClearFilters}>
                Clear All
              </Button>
            )}
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Status Filter */}
        <div>
          <Label htmlFor='filter-status'>Status</Label>
          <Select
            value={filters.status?.join(',') || ''}
            onValueChange={value =>
              handleStatusChange(value ? value.split(',') : [])
            }
          >
            <SelectTrigger id='filter-status'>
              <SelectValue placeholder='All statuses' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All statuses</SelectItem>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Filter */}
        <div>
          <Label htmlFor='filter-client'>Client</Label>
          <Select
            value={filters.clientId || ''}
            onValueChange={handleClientChange}
          >
            <SelectTrigger id='filter-client'>
              <SelectValue placeholder='All clients' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=''>All clients</SelectItem>
              {[...contacts, ...companies].map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className='pt-4 border-t'>
            <h4 className='text-sm font-medium mb-2'>Active Filters:</h4>
            <div className='flex flex-wrap gap-2'>
              {filters.status && filters.status.length > 0 && (
                <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                  Status: {filters.status.join(', ')}
                  <button
                    onClick={() => handleStatusChange([])}
                    className='ml-1 hover:text-blue-600'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              )}

              {filters.clientId && (
                <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
                  Client: {filters.clientId}
                  <button
                    onClick={() => handleClientChange('')}
                    className='ml-1 hover:text-green-600'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
