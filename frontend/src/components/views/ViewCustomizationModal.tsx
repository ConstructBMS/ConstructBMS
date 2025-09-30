import { useState } from 'react';
import { Button } from '../ui';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useViewStore } from '../../app/store/ui/view.store';
import { useKanbanStore } from '../../app/store/ui/kanban.store';
import type { ViewMode } from '../../app/store/ui/view.store';
import type { KanbanColumn } from './UnifiedKanban';

interface ViewCustomizationModalProps {
  moduleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewCustomizationModal({
  moduleId,
  isOpen,
  onClose,
}: ViewCustomizationModalProps) {
  const { getViewSettings, updateViewSettings, resetViewSettings } = useViewStore();
  const { getConfig, updateColumns, addColumn, deleteColumn } = useKanbanStore();
  
  const [activeTab, setActiveTab] = useState('general');
  const [kanbanColumns, setKanbanColumns] = useState<KanbanColumn[]>([]);
  
  const viewSettings = getViewSettings(moduleId);
  const kanbanConfig = getConfig(moduleId);
  
  // Initialize kanban columns
  useState(() => {
    if (kanbanConfig?.columns) {
      setKanbanColumns(kanbanConfig.columns);
    }
  });

  const handleViewModeChange = (mode: ViewMode) => {
    updateViewSettings(moduleId, { mode });
  };

  const handleSortChange = (sortBy: string) => {
    updateViewSettings(moduleId, { sortBy });
  };

  const handleSortDirectionChange = (direction: 'asc' | 'desc') => {
    updateViewSettings(moduleId, { sortDirection: direction });
  };

  const handleKanbanColumnAdd = () => {
    const newColumn: Omit<KanbanColumn, 'id' | 'order'> = {
      name: 'New Column',
      color: 'blue',
    };
    addColumn(moduleId, newColumn);
    // Refresh columns
    const updatedConfig = getConfig(moduleId);
    if (updatedConfig?.columns) {
      setKanbanColumns(updatedConfig.columns);
    }
  };

  const handleKanbanColumnUpdate = (columnId: string, updates: Partial<KanbanColumn>) => {
    const updatedColumns = kanbanColumns.map(col =>
      col.id === columnId ? { ...col, ...updates } : col
    );
    setKanbanColumns(updatedColumns);
    updateColumns(moduleId, updatedColumns);
  };

  const handleKanbanColumnDelete = (columnId: string) => {
    deleteColumn(moduleId, columnId);
    const updatedColumns = kanbanColumns.filter(col => col.id !== columnId);
    setKanbanColumns(updatedColumns);
  };

  const handleReset = () => {
    resetViewSettings(moduleId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>View Customization - {moduleId}</CardTitle>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="view-mode">Default View Mode</Label>
                  <Select
                    value={viewSettings.mode}
                    onValueChange={handleViewModeChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="kanban">Kanban</SelectItem>
                      <SelectItem value="timeline">Timeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sort-by">Default Sort By</Label>
                  <Select
                    value={viewSettings.sortBy || 'createdAt'}
                    onValueChange={handleSortChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="updatedAt">Updated Date</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sort-direction">Sort Direction</Label>
                  <Select
                    value={viewSettings.sortDirection || 'desc'}
                    onValueChange={handleSortDirectionChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="kanban" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Kanban Columns</h3>
                  <Button onClick={handleKanbanColumnAdd} size="sm">
                    Add Column
                  </Button>
                </div>

                <div className="space-y-2">
                  {kanbanColumns.map((column, index) => (
                    <div key={column.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <Input
                          value={column.name}
                          onChange={(e) => handleKanbanColumnUpdate(column.id, { name: e.target.value })}
                          placeholder="Column name"
                        />
                        <Select
                          value={column.color}
                          onValueChange={(color) => handleKanbanColumnUpdate(column.id, { color: color as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="yellow">Yellow</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="pink">Pink</SelectItem>
                            <SelectItem value="gray">Gray</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Order: {index + 1}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleKanbanColumnDelete(column.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">List View Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-actions">Show Action Buttons</Label>
                    <Switch
                      id="show-actions"
                      checked={viewSettings.customizations?.showActions !== false}
                      onCheckedChange={(checked) =>
                        updateViewSettings(moduleId, {
                          customizations: {
                            ...viewSettings.customizations,
                            showActions: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-priority">Show Priority Badges</Label>
                    <Switch
                      id="show-priority"
                      checked={viewSettings.customizations?.showPriority !== false}
                      onCheckedChange={(checked) =>
                        updateViewSettings(moduleId, {
                          customizations: {
                            ...viewSettings.customizations,
                            showPriority: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save">Auto-save Changes</Label>
                    <Switch
                      id="auto-save"
                      checked={viewSettings.customizations?.autoSave !== false}
                      onCheckedChange={(checked) =>
                        updateViewSettings(moduleId, {
                          customizations: {
                            ...viewSettings.customizations,
                            autoSave: checked,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="remember-filters">Remember Filters</Label>
                    <Switch
                      id="remember-filters"
                      checked={viewSettings.customizations?.rememberFilters !== false}
                      onCheckedChange={(checked) =>
                        updateViewSettings(moduleId, {
                          customizations: {
                            ...viewSettings.customizations,
                            rememberFilters: checked,
                          },
                        })
                      }
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="destructive" onClick={handleReset}>
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
