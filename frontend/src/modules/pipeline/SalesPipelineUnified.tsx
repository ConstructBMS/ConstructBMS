import { useState } from 'react';
import { UnifiedKanban } from '../../components/views/UnifiedKanban';
import { useKanbanStore } from '../../app/store/ui/kanban.store';
import type { KanbanColumn, KanbanItem } from '../../components/views/UnifiedKanban';
import { Button } from '../../components/ui';
import { Card, CardContent } from '../../components/ui/card';
import { DollarSign, Edit2, Trash2, User } from 'lucide-react';

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  name: string;
  details: string;
  value: number;
  stage: string;
  clientId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const demoClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+44 20 7123 4567',
    company: 'ABC Corporation',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+44 20 7123 4568',
    company: 'XYZ Ltd',
    createdAt: '2024-01-20',
  },
];

const demoOpportunities: Opportunity[] = [
  {
    id: '1',
    name: 'Office Renovation Project',
    details: 'Complete office renovation for ABC Corporation',
    value: 250000,
    stage: 'lead',
    clientId: '1',
    notes: 'Initial inquiry received. Need to schedule site visit.',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Warehouse Construction',
    details: 'New warehouse construction for XYZ Ltd',
    value: 850000,
    stage: 'qualified',
    clientId: '2',
    notes: 'Proposal submitted. Follow-up scheduled for next week.',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20',
  },
];

export default function SalesPipelineUnified() {
  const { getConfig, updateColumns } = useKanbanStore();
  const [opportunities, setOpportunities] = useState<Opportunity[]>(demoOpportunities);
  const [clients] = useState<Client[]>(demoClients);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  const moduleId = 'pipeline';
  const config = getConfig(moduleId);
  const columns = config?.columns || [];

  // Convert opportunities to Kanban items
  const kanbanItems: KanbanItem[] = opportunities.map(opp => {
    const client = clients.find(c => c.id === opp.clientId);
    return {
      id: opp.id,
      title: opp.name,
      description: opp.details,
      status: opp.stage,
      priority: opp.value > 500000 ? 'high' : opp.value > 250000 ? 'medium' : 'low',
      assignee: client?.name,
      dueDate: opp.updatedAt,
      metadata: {
        value: opp.value,
        clientId: opp.clientId,
        notes: opp.notes,
        createdAt: opp.createdAt,
        updatedAt: opp.updatedAt,
      },
    };
  });

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    updateColumns(moduleId, newColumns);
  };

  const handleItemsChange = (newItems: KanbanItem[]) => {
    // Convert Kanban items back to opportunities
    const updatedOpportunities = newItems.map(item => {
      const originalOpp = opportunities.find(opp => opp.id === item.id);
      return {
        ...originalOpp!,
        stage: item.status,
        updatedAt: new Date().toISOString(),
      };
    });
    setOpportunities(updatedOpportunities);
  };

  const handleItemClick = (item: KanbanItem) => {
    console.log('Item clicked:', item);
    // Handle item click - could open detail modal
  };

  const handleItemEdit = (item: KanbanItem) => {
    const opportunity = opportunities.find(opp => opp.id === item.id);
    if (opportunity) {
      setEditingOpportunity(opportunity);
    }
  };

  const handleItemDelete = (item: KanbanItem) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== item.id));
  };

  const handleAddItem = (columnId: string) => {
    console.log('Add item to column:', columnId);
    // Handle adding new opportunity
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
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

  const renderOpportunityItem = (item: KanbanItem) => (
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
            
            {/* Value and Priority */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-green-600">
                {formatCurrency(item.metadata?.value as number || 0)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority || 'low')}`}>
                {item.priority?.toUpperCase()}
              </span>
            </div>

            {/* Client and Date Info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.assignee && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{item.assignee}</span>
                </div>
              )}
              {item.dueDate && (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span>{new Date(item.dueDate).toLocaleDateString()}</span>
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
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleItemDelete(item);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground">
            Manage your sales opportunities and track progress through the pipeline
          </p>
        </div>
        <Button>
          Add Opportunity
        </Button>
      </div>

      <UnifiedKanban
        columns={columns}
        items={kanbanItems}
        onColumnsChange={handleColumnsChange}
        onItemsChange={handleItemsChange}
        onItemClick={handleItemClick}
        onItemEdit={handleItemEdit}
        onItemDelete={handleItemDelete}
        onAddItem={handleAddItem}
        renderItem={renderOpportunityItem}
        canEdit={true}
        moduleId={moduleId}
      />
    </div>
  );
}
