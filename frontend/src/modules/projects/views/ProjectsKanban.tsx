import { Calendar, Edit, Eye, User } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Card, CardContent } from '../../../components/ui';
import { UnifiedKanban } from '../../../components/views/UnifiedKanban';
import { useKanbanStore } from '../../../app/store/ui/kanban.store';
import type { Project, ProjectStatus } from '../../../lib/types/projects';
import type { KanbanColumn, KanbanItem } from '../../../components/views/UnifiedKanban';

interface ProjectsKanbanProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onView: (project: Project) => void;
  canEdit: boolean;
}

export function ProjectsKanban({
  projects,
  onEdit,
  onView,
  canEdit,
}: ProjectsKanbanProps) {
  const { getConfig, updateColumns } = useKanbanStore();
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);

  const moduleId = 'projects';
  const config = getConfig(moduleId);
  const columns = config?.columns || [];

  // Convert projects to Kanban items
  const kanbanItems: KanbanItem[] = localProjects.map(project => ({
    id: project.id,
    title: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority || 'medium',
    assignee: project.manager,
    dueDate: project.endDate,
    metadata: {
      budget: project.budget,
      startDate: project.startDate,
      tags: project.tags,
      client: project.client,
    },
  }));

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    updateColumns(moduleId, newColumns);
  };

  const handleItemsChange = (newItems: KanbanItem[]) => {
    // Convert Kanban items back to projects
    const updatedProjects = newItems.map(item => {
      const originalProject = localProjects.find(proj => proj.id === item.id);
      return {
        ...originalProject!,
        status: item.status as ProjectStatus,
      };
    });
    setLocalProjects(updatedProjects);
  };

  const handleItemClick = (item: KanbanItem) => {
    const project = localProjects.find(proj => proj.id === item.id);
    if (project) {
      onView(project);
    }
  };

  const handleItemEdit = (item: KanbanItem) => {
    const project = localProjects.find(proj => proj.id === item.id);
    if (project) {
      onEdit(project);
    }
  };

  const handleItemDelete = (item: KanbanItem) => {
    setLocalProjects(prev => prev.filter(proj => proj.id !== item.id));
  };

  const handleAddItem = (columnId: string) => {
    console.log('Add project to column:', columnId);
    // Handle adding new project
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderProjectItem = (item: KanbanItem) => (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
            {item.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Budget and Priority */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(item.metadata?.budget as number)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority || 'medium')}`}>
                {item.priority?.toUpperCase()}
              </span>
            </div>

            {/* Manager and Date Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{item.assignee}</span>
                </div>
              )}
              {item.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(item.dueDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-1 ml-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleItemEdit(item);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleItemClick(item);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <UnifiedKanban
      columns={columns}
      items={kanbanItems}
      onColumnsChange={handleColumnsChange}
      onItemsChange={handleItemsChange}
      onItemClick={handleItemClick}
      onItemEdit={handleItemEdit}
      onItemDelete={handleItemDelete}
      onAddItem={handleAddItem}
      renderItem={renderProjectItem}
      canEdit={canEdit}
      moduleId={moduleId}
    />
  );
}