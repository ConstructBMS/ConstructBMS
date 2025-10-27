import {
  Calendar,
  ChevronDown,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { EmailFilter, EmailFolder } from '../../lib/types/email';
import { useEmailStore } from '../../app/store/email.store';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface EmailSearchProps {
  onClose?: () => void;
}

export function EmailSearch({ onClose }: EmailSearchProps) {
  const {
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    clearFilter,
  } = useEmailStore();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tempFilter, setTempFilter] = useState<EmailFilter>(filter);

  const folderOptions: { value: EmailFolder; label: string }[] = [
    { value: 'inbox', label: 'Inbox' },
    { value: 'sent', label: 'Sent Items' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'trash', label: 'Deleted Items' },
    { value: 'spam', label: 'Junk Email' },
    { value: 'archive', label: 'Archive' },
    { value: 'important', label: 'Important' },
    { value: 'flagged', label: 'Flagged Items' },
  ];

  const handleApplyFilter = () => {
    setFilter(tempFilter);
    if (onClose) onClose();
  };

  const handleClearFilter = () => {
    setTempFilter({});
    clearFilter();
    if (onClose) onClose();
  };

  const hasActiveFilters = Object.keys(filter).length > 0 || searchQuery.length > 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Search & Filter</CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-2">
          <Label>Quick Filters</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter.isRead === false ? "default" : "outline"}
              size="sm"
              onClick={() => setTempFilter(prev => ({ 
                ...prev, 
                isRead: prev.isRead === false ? undefined : false 
              }))}
            >
              Unread
            </Button>
            <Button
              variant={filter.isImportant ? "default" : "outline"}
              size="sm"
              onClick={() => setTempFilter(prev => ({ 
                ...prev, 
                isImportant: prev.isImportant ? undefined : true 
              }))}
            >
              Important
            </Button>
            <Button
              variant={filter.isFlagged ? "default" : "outline"}
              size="sm"
              onClick={() => setTempFilter(prev => ({ 
                ...prev, 
                isFlagged: prev.isFlagged ? undefined : true 
              }))}
            >
              Flagged
            </Button>
            <Button
              variant={filter.attachments ? "default" : "outline"}
              size="sm"
              onClick={() => setTempFilter(prev => ({ 
                ...prev, 
                attachments: prev.attachments ? undefined : true 
              }))}
            >
              With Attachments
            </Button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilter}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Folder Filter */}
            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Select
                value={tempFilter.folder || ''}
                onValueChange={(value) => setTempFilter(prev => ({ 
                  ...prev, 
                  folder: value as EmailFolder || undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All folders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All folders</SelectItem>
                  {folderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Filter */}
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                placeholder="Sender email or name"
                value={tempFilter.from || ''}
                onChange={(e) => setTempFilter(prev => ({ 
                  ...prev, 
                  from: e.target.value || undefined 
                }))}
              />
            </div>

            {/* To Filter */}
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                placeholder="Recipient email or name"
                value={tempFilter.to || ''}
                onChange={(e) => setTempFilter(prev => ({ 
                  ...prev, 
                  to: e.target.value || undefined 
                }))}
              />
            </div>

            {/* Subject Filter */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Subject contains"
                value={tempFilter.subject || ''}
                onChange={(e) => setTempFilter(prev => ({ 
                  ...prev, 
                  subject: e.target.value || undefined 
                }))}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={tempFilter.dateFrom || ''}
                  onChange={(e) => setTempFilter(prev => ({ 
                    ...prev, 
                    dateFrom: e.target.value || undefined 
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={tempFilter.dateTo || ''}
                  onChange={(e) => setTempFilter(prev => ({ 
                    ...prev, 
                    dateTo: e.target.value || undefined 
                  }))}
                />
              </div>
            </div>

            {/* Labels Filter */}
            <div className="space-y-2">
              <Label htmlFor="labels">Labels</Label>
              <Input
                id="labels"
                placeholder="Comma-separated labels"
                value={tempFilter.labels?.join(', ') || ''}
                onChange={(e) => setTempFilter(prev => ({ 
                  ...prev, 
                  labels: e.target.value ? e.target.value.split(',').map(l => l.trim()) : undefined 
                }))}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleClearFilter}>
            Clear
          </Button>
          <Button onClick={handleApplyFilter}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
