import { DollarSign, Edit2, Trash2, User } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { useKanbanStore } from '../../app/store/ui/kanban.store';
import { Button } from '../../components/ui';
import { Card, CardContent } from '../../components/ui/card';
import type {
  KanbanColumn,
  KanbanItem,
} from '../../components/views/UnifiedKanban';
import { UnifiedKanban } from '../../components/views/UnifiedKanban';
import {
  Opportunity as ModalOpportunity,
  OpportunityModal,
} from '../../components/modals/OpportunityModal';

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
  {
    id: '3',
    name: 'Residential Development',
    details: '50-unit residential complex in Manchester',
    value: 1200000,
    stage: 'proposal',
    clientId: '1',
    notes: 'Detailed proposal with 3D renderings submitted.',
    createdAt: '2024-01-25',
    updatedAt: '2024-01-25',
  },
  {
    id: '4',
    name: 'Retail Space Fit-out',
    details: 'High-end retail space fit-out for luxury brand',
    value: 180000,
    stage: 'negotiation',
    clientId: '2',
    notes: 'Price negotiations ongoing. Client very interested.',
    createdAt: '2024-01-28',
    updatedAt: '2024-01-28',
  },
  {
    id: '5',
    name: 'Industrial Facility',
    details: 'Large-scale industrial facility construction',
    value: 2500000,
    stage: 'closed-won',
    clientId: '1',
    notes: 'Contract signed! Project starts in March.',
    createdAt: '2024-01-30',
    updatedAt: '2024-01-30',
  },
  {
    id: '6',
    name: 'Hotel Renovation',
    details: 'Complete hotel renovation and modernization',
    value: 950000,
    stage: 'closed-lost',
    clientId: '2',
    notes: 'Client chose competitor. Follow up in 6 months.',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01',
  },
  {
    id: '7',
    name: 'School Extension',
    details: 'Primary school extension with new classrooms',
    value: 320000,
    stage: 'lead',
    clientId: '1',
    notes: 'Initial meeting scheduled for next week.',
    createdAt: '2024-02-05',
    updatedAt: '2024-02-05',
  },
  {
    id: '8',
    name: 'Medical Center',
    details: 'New medical center construction',
    value: 1800000,
    stage: 'qualified',
    clientId: '2',
    notes: 'Client very interested. Waiting for budget approval.',
    createdAt: '2024-02-08',
    updatedAt: '2024-02-08',
  },
];

export default function SalesPipelineUnified() {
  const { getConfig, updateColumns } = useKanbanStore();
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(demoOpportunities);
  const [clients] = useState<Client[]>(demoClients);
  const [editingOpportunity, setEditingOpportunity] =
    useState<Opportunity | null>(null);
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [modalOpportunity, setModalOpportunity] =
    useState<ModalOpportunity | undefined>(undefined);

  // Load opportunities from localStorage on mount
  useEffect(() => {
    const savedOpportunities = localStorage.getItem('pipeline-opportunities');
    if (savedOpportunities) {
      try {
        const parsed = JSON.parse(savedOpportunities);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOpportunities(parsed);
        }
      } catch (error) {
        console.error('Failed to parse saved opportunities:', error);
        // Fallback to demo data if parsing fails
        setOpportunities(demoOpportunities);
      }
    }
  }, []);

  // Save opportunities to localStorage whenever they change
  useEffect(() => {
    if (opportunities.length > 0) {
      localStorage.setItem('pipeline-opportunities', JSON.stringify(opportunities));
    }
  }, [opportunities]);

  // Also save kanban items state for persistence
  useEffect(() => {
    const kanbanItems = opportunities.map(opp => {
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
    localStorage.setItem('pipeline-kanban-items', JSON.stringify(kanbanItems));
  }, [opportunities, clients]);

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
      priority:
        opp.value > 500000 ? 'high' : opp.value > 250000 ? 'medium' : 'low',
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

  const mapToModalOpportunity = (opp: Opportunity): ModalOpportunity => {
    const client = clients.find(c => c.id === opp.clientId);
    return {
      id: opp.id,
      title: opp.name,
      description: opp.details,
      amount: opp.value,
      stage: opp.stage,
      customer: client
        ? { id: client.id, name: client.name, email: client.email, phone: client.phone }
        : undefined,
      contact: undefined,
      startDate: opp.createdAt,
      endDate: opp.updatedAt,
      source: 'Pipeline',
      owner: 'Unassigned',
      tags: [],
      activities: [],
      createdAt: opp.createdAt,
      updatedAt: opp.updatedAt,
    };
  };

  const mapFromModalOpportunity = (
    modal: ModalOpportunity,
    previous?: Opportunity
  ): Opportunity => {
    return {
      id: previous?.id || modal.id || String(Date.now()),
      name: modal.title,
      details: modal.description || '',
      value: modal.amount || 0,
      stage: modal.stage,
      clientId: modal.customer?.id || previous?.clientId || clients[0]?.id || '1',
      notes: previous?.notes || '',
      createdAt: previous?.createdAt || modal.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleItemClick = (item: KanbanItem) => {
    const opp = opportunities.find(o => o.id === item.id);
    if (!opp) return;
    setModalOpportunity(mapToModalOpportunity(opp));
    setIsOpportunityModalOpen(true);
  };

  const handleItemEdit = (item: KanbanItem) => {
    const opportunity = opportunities.find(opp => opp.id === item.id);
    if (opportunity) {
      setEditingOpportunity(opportunity);
      setModalOpportunity(mapToModalOpportunity(opportunity));
      setIsOpportunityModalOpen(true);
    }
  };

  const handleItemDelete = (item: KanbanItem) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== item.id));
  };

  const handleAddItem = (columnId: string) => {
    const newModalOpp: ModalOpportunity = {
      id: '',
      title: '',
      description: '',
      amount: 0,
      stage: columnId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ModalOpportunity;
    setModalOpportunity(newModalOpp);
    setIsOpportunityModalOpen(true);
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
    <Card className='mb-3 cursor-pointer hover:shadow-md transition-shadow'>
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <h4 className='font-semibold text-sm mb-1'>{item.title}</h4>
            {item.description && (
              <p className='text-xs text-muted-foreground mb-2 line-clamp-2'>
                {item.description}
              </p>
            )}

            {/* Value and Priority */}
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-sm font-medium text-green-600'>
                {formatCurrency((item.metadata?.value as number) || 0)}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority || 'low')}`}
              >
                {item.priority?.toUpperCase()}
              </span>
            </div>

            {/* Client and Date Info */}
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              {item.assignee && (
                <div className='flex items-center gap-1'>
                  <User className='h-3 w-3' />
                  <span>{item.assignee}</span>
                </div>
              )}
              {item.dueDate && (
                <div className='flex items-center gap-1'>
                  <DollarSign className='h-3 w-3' />
                  <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-1 ml-2'>
            <Button
              size='sm'
              variant='ghost'
              onClick={e => {
                e.stopPropagation();
                handleItemEdit(item);
              }}
            >
              <Edit2 className='h-3 w-3' />
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={e => {
                e.stopPropagation();
                handleItemDelete(item);
              }}
            >
              <Trash2 className='h-3 w-3' />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>Sales Pipeline</h1>
          <p className='text-muted-foreground'>
            Manage your sales opportunities and track progress through the
            pipeline
          </p>
        </div>
        <Button>Add Opportunity</Button>
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

      {isOpportunityModalOpen && (
        <OpportunityModal
          isOpen={isOpportunityModalOpen}
          onClose={() => {
            setIsOpportunityModalOpen(false);
            setModalOpportunity(undefined);
          }}
          opportunity={modalOpportunity}
          onSave={saved => {
            // Map back to local model and update state
            const existing = opportunities.find(o => o.id === (saved.id || ''));
            if (existing) {
              const updated = mapFromModalOpportunity(saved, existing);
              setOpportunities(prev => prev.map(o => (o.id === existing.id ? updated : o)));
            } else {
              const created = mapFromModalOpportunity(saved);
              setOpportunities(prev => [...prev, created]);
            }
            setIsOpportunityModalOpen(false);
            setModalOpportunity(undefined);
          }}
          onDelete={id => {
            setOpportunities(prev => prev.filter(o => o.id !== id));
          }}
        />
      )}
    </div>
  );
}
