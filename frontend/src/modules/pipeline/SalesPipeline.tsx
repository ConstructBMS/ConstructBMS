import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import {
  DollarSign,
  Edit2,
  FileText,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui';
import { useTheme } from '../../contexts/ThemeContext';

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
  clientId?: string;
  client?: Client;
  stage: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

// Demo data
const demoClients: Client[] = [
  {
    id: 'client-1',
    name: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '+1-555-0123',
    company: 'ACME Corp',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-2',
    name: 'Sarah Johnson',
    email: 'sarah@techstart.com',
    phone: '+1-555-0456',
    company: 'TechStart Inc',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'client-3',
    name: 'Mike Wilson',
    email: 'mike@buildco.com',
    phone: '+1-555-0789',
    company: 'BuildCo Ltd',
    createdAt: new Date().toISOString(),
  },
];

const demoOpportunities: Opportunity[] = [
  {
    id: 'opp-1',
    name: 'Office Building Construction',
    details: 'New 5-story office building in downtown area',
    value: 2500000,
    clientId: 'client-1',
    client: demoClients[0],
    stage: 'lead',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Initial consultation completed. Client very interested.',
  },
  {
    id: 'opp-2',
    name: 'Warehouse Renovation',
    details: 'Complete renovation of existing warehouse facility',
    value: 850000,
    clientId: 'client-2',
    client: demoClients[1],
    stage: 'qualified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Budget approved. Waiting for final specifications.',
  },
  {
    id: 'opp-3',
    name: 'Residential Complex',
    details: '50-unit residential complex with amenities',
    value: 1800000,
    clientId: 'client-3',
    client: demoClients[2],
    stage: 'proposal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Proposal submitted. Follow-up scheduled for next week.',
  },
];

const defaultStages: PipelineStage[] = [
  { id: 'lead', name: 'Lead', color: 'bg-blue-100', order: 0 },
  { id: 'qualified', name: 'Qualified', color: 'bg-yellow-100', order: 1 },
  { id: 'proposal', name: 'Proposal', color: 'bg-orange-100', order: 2 },
  { id: 'negotiation', name: 'Negotiation', color: 'bg-purple-100', order: 3 },
  { id: 'closed-won', name: 'Closed Won', color: 'bg-green-100', order: 4 },
  { id: 'closed-lost', name: 'Closed Lost', color: 'bg-red-100', order: 5 },
];

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-100', border: 'border-blue-300' },
  { name: 'Yellow', value: 'bg-yellow-100', border: 'border-yellow-300' },
  { name: 'Orange', value: 'bg-orange-100', border: 'border-orange-300' },
  { name: 'Purple', value: 'bg-purple-100', border: 'border-purple-300' },
  { name: 'Green', value: 'bg-green-100', border: 'border-green-300' },
  { name: 'Red', value: 'bg-red-100', border: 'border-red-300' },
  { name: 'Pink', value: 'bg-pink-100', border: 'border-pink-300' },
  { name: 'Teal', value: 'bg-teal-100', border: 'border-teal-300' },
];

export default function SalesPipeline() {
  const { theme } = useTheme();
  const [stages, setStages] = useState<PipelineStage[]>(defaultStages);
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(demoOpportunities);
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<string | null>(
    null
  );
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [showNewOpportunityModal, setShowNewOpportunityModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('lead');

  // New opportunity form state
  const [newOpportunity, setNewOpportunity] = useState({
    name: '',
    details: '',
    value: 0,
    clientId: '',
    notes: '',
  });

  // New client form state
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  // Stage editing state
  const [editingStageName, setEditingStageName] = useState('');
  const [editingStageColor, setEditingStageColor] = useState('');

  // Opportunity editing state
  const [editingOpportunityData, setEditingOpportunityData] = useState({
    name: '',
    details: '',
    value: 0,
    clientId: '',
    notes: '',
  });

  const handleDragUpdate = (result: any) => {
    // This provides visual feedback during dragging
    // The drop zone indicator is handled automatically by @hello-pangea/dnd
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Get the opportunities for the source and destination stages
    const sourceOpportunities = getOpportunitiesByStage(source.droppableId);
    const destOpportunities = getOpportunitiesByStage(destination.droppableId);

    // If moving within the same column
    if (source.droppableId === destination.droppableId) {
      const newOpportunities = Array.from(sourceOpportunities);
      const [reorderedOpportunity] = newOpportunities.splice(source.index, 1);
      newOpportunities.splice(destination.index, 0, reorderedOpportunity);

      // Update the opportunities with new order
      setOpportunities(prev => {
        const otherOpportunities = prev.filter(
          opp => opp.stage !== source.droppableId
        );
        return [...otherOpportunities, ...newOpportunities];
      });
    } else {
      // Moving between different columns
      const newSourceOpportunities = Array.from(sourceOpportunities);
      const newDestOpportunities = Array.from(destOpportunities);

      const [movedOpportunity] = newSourceOpportunities.splice(source.index, 1);
      movedOpportunity.stage = destination.droppableId;
      movedOpportunity.updatedAt = new Date().toISOString();

      newDestOpportunities.splice(destination.index, 0, movedOpportunity);

      // Update all opportunities
      setOpportunities(prev => {
        const otherOpportunities = prev.filter(
          opp =>
            opp.stage !== source.droppableId &&
            opp.stage !== destination.droppableId
        );
        return [
          ...otherOpportunities,
          ...newSourceOpportunities,
          ...newDestOpportunities,
        ];
      });
    }
  };

  const startEditStage = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      setEditingStage(stageId);
      setEditingStageName(stage.name);
      setEditingStageColor(stage.color);
    }
  };

  const saveStageEdit = () => {
    if (editingStage) {
      setStages(prev =>
        prev.map(stage =>
          stage.id === editingStage
            ? { ...stage, name: editingStageName, color: editingStageColor }
            : stage
        )
      );
      setEditingStage(null);
    }
  };

  const cancelStageEdit = () => {
    setEditingStage(null);
    setEditingStageName('');
    setEditingStageColor('');
  };

  const startEditOpportunity = (oppId: string) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (opp) {
      setEditingOpportunity(oppId);
      setEditingOpportunityData({
        name: opp.name,
        details: opp.details,
        value: opp.value,
        clientId: opp.clientId || '',
        notes: opp.notes || '',
      });
    }
  };

  const saveOpportunityEdit = () => {
    if (editingOpportunity) {
      setOpportunities(prev =>
        prev.map(opp =>
          opp.id === editingOpportunity
            ? {
                ...opp,
                ...editingOpportunityData,
                client: clients.find(
                  c => c.id === editingOpportunityData.clientId
                ),
                updatedAt: new Date().toISOString(),
              }
            : opp
        )
      );
      setEditingOpportunity(null);
    }
  };

  const cancelOpportunityEdit = () => {
    setEditingOpportunity(null);
    setEditingOpportunityData({
      name: '',
      details: '',
      value: 0,
      clientId: '',
      notes: '',
    });
  };

  const createNewClient = () => {
    const client: Client = {
      id: `client-${Date.now()}`,
      ...newClient,
      createdAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, client]);
    setNewClient({ name: '', email: '', phone: '', company: '' });
    setShowNewClientModal(false);
  };

  const createNewOpportunity = () => {
    const opportunity: Opportunity = {
      id: `opp-${Date.now()}`,
      ...newOpportunity,
      stage: selectedStage,
      client: clients.find(c => c.id === newOpportunity.clientId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOpportunities(prev => [...prev, opportunity]);
    setNewOpportunity({
      name: '',
      details: '',
      value: 0,
      clientId: '',
      notes: '',
    });
    setShowNewOpportunityModal(false);
  };

  const deleteOpportunity = (oppId: string) => {
    setOpportunities(prev => prev.filter(opp => opp.id !== oppId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stage === stageId);
  };

  return (
    <div 
      className={`p-6 min-h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className='mb-6'>
        <h1 
          className={`text-3xl font-bold mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Sales Pipeline
        </h1>
        <p 
          className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}
        >
          Manage your sales opportunities and track progress through the
          pipeline
        </p>
      </div>

      <div className='flex justify-between items-center mb-6'>
        <div className='flex gap-4'>
          <Button
            onClick={() => setShowNewOpportunityModal(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white'
          >
            <Plus className='w-4 h-4 mr-2' />
            New Opportunity
          </Button>
          <Button onClick={() => setShowNewClientModal(true)} variant='outline'>
            <User className='w-4 h-4 mr-2' />
            New Client
          </Button>
        </div>
      </div>

      <div className='overflow-x-auto pb-4'>
        <DragDropContext
          onDragUpdate={handleDragUpdate}
          onDragEnd={handleDragEnd}
        >
          <div className='flex gap-6 min-w-max'>
            {stages.map(stage => (
              <div key={stage.id} className='flex-shrink-0 w-80'>
                <div
                  className={`${stage.color} border-2 ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                  } rounded-lg p-4 min-h-96`}
                >
                  {/* Stage Header */}
                  <div className='flex items-center justify-between mb-4'>
                    {editingStage === stage.id ? (
                      <div className='flex-1 mr-2'>
                        <input
                          type='text'
                          value={editingStageName}
                          onChange={e => setEditingStageName(e.target.value)}
                          className={`w-full px-2 py-1 text-lg font-semibold rounded ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-500 text-white' 
                              : 'bg-white border-gray-300'
                          } border`}
                          autoFocus
                        />
                        <div className='flex gap-2 mt-2'>
                          <select
                            value={editingStageColor}
                            onChange={e => setEditingStageColor(e.target.value)}
                            className={`px-2 py-1 text-sm rounded border ${
                              theme === 'dark' 
                                ? 'bg-gray-700 border-gray-500 text-white' 
                                : 'bg-white border-gray-300'
                            }`}
                          >
                            {colorOptions.map(color => (
                              <option key={color.value} value={color.value}>
                                {color.name}
                              </option>
                            ))}
                          </select>
                          <Button size='sm' onClick={saveStageEdit}>
                            <Save className='w-3 h-3' />
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={cancelStageEdit}
                          >
                            <X className='w-3 h-3' />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 
                          className={`text-lg font-semibold ${
                            theme === 'dark' ? 'text-gray-100' : 'text-gray-800'
                          }`}
                        >
                          {stage.name}
                        </h3>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => startEditStage(stage.id)}
                        >
                          <Edit2 className='w-4 h-4' />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Stage Content */}
                  <Droppable
                    droppableId={stage.id}
                    type='OPPORTUNITY'
                    direction='vertical'
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-64 transition-colors duration-200 ${
                          snapshot.isDraggingOver
                            ? theme === 'dark' 
                              ? 'bg-blue-900 border-2 border-blue-400 border-dashed'
                              : 'bg-blue-50 border-2 border-blue-300 border-dashed'
                            : ''
                        }`}
                      >
                        {getOpportunitiesByStage(stage.id).map(
                          (opportunity, index) => (
                            <Draggable
                              key={opportunity.id}
                              draggableId={opportunity.id}
                              index={index}
                              type='OPPORTUNITY'
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`rounded-lg shadow-sm border p-4 mb-3 transition-all duration-200 ${
                                    theme === 'dark' 
                                      ? 'bg-gray-800 border-gray-600' 
                                      : 'bg-white border-gray-200'
                                  } ${
                                    snapshot.isDragging
                                      ? 'shadow-xl rotate-2 scale-105 border-blue-300'
                                      : 'hover:shadow-md'
                                  }`}
                                >
                                  {editingOpportunity === opportunity.id ? (
                                    <div className='space-y-3'>
                                      <input
                                        type='text'
                                        value={editingOpportunityData.name}
                                        onChange={e =>
                                          setEditingOpportunityData(prev => ({
                                            ...prev,
                                            name: e.target.value,
                                          }))
                                        }
                                        className={`w-full px-2 py-1 font-semibold border rounded ${
                                          theme === 'dark' 
                                            ? 'bg-gray-700 border-gray-500 text-white' 
                                            : 'bg-white border-gray-300'
                                        }`}
                                        placeholder='Opportunity name'
                                      />
                                      <textarea
                                        value={editingOpportunityData.details}
                                        onChange={e =>
                                          setEditingOpportunityData(prev => ({
                                            ...prev,
                                            details: e.target.value,
                                          }))
                                        }
                                        className={`w-full px-2 py-1 text-sm border rounded ${
                                          theme === 'dark' 
                                            ? 'bg-gray-700 border-gray-500 text-white' 
                                            : 'bg-white border-gray-300'
                                        }`}
                                        placeholder='Opportunity details'
                                        rows={2}
                                      />
                                      <div className='flex gap-2'>
                                        <input
                                          type='number'
                                          value={editingOpportunityData.value}
                                          onChange={e =>
                                            setEditingOpportunityData(prev => ({
                                              ...prev,
                                              value: Number(e.target.value),
                                            }))
                                          }
                                          className={`flex-1 px-2 py-1 text-sm border rounded ${
                                            theme === 'dark' 
                                              ? 'bg-gray-700 border-gray-500 text-white' 
                                              : 'bg-white border-gray-300'
                                          }`}
                                          placeholder='Value'
                                        />
                                        <div className='flex gap-1'>
                                          <select
                                            value={
                                              editingOpportunityData.clientId
                                            }
                                            onChange={e =>
                                              setEditingOpportunityData(
                                                prev => ({
                                                  ...prev,
                                                  clientId: e.target.value,
                                                })
                                              )
                                            }
                                            className={`flex-1 px-2 py-1 text-sm border rounded ${
                                              theme === 'dark' 
                                                ? 'bg-gray-700 border-gray-500 text-white' 
                                                : 'bg-white border-gray-300'
                                            }`}
                                          >
                                            <option value=''>
                                              Select client
                                            </option>
                                            {clients.map(client => (
                                              <option
                                                key={client.id}
                                                value={client.id}
                                              >
                                                {client.name} ({client.company})
                                              </option>
                                            ))}
                                          </select>
                                          <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() =>
                                              setShowNewClientModal(true)
                                            }
                                            className='px-2 py-1 text-xs'
                                          >
                                            <Plus className='w-3 h-3' />
                                          </Button>
                                        </div>
                                      </div>
                                      <textarea
                                        value={editingOpportunityData.notes}
                                        onChange={e =>
                                          setEditingOpportunityData(prev => ({
                                            ...prev,
                                            notes: e.target.value,
                                          }))
                                        }
                                        className={`w-full px-2 py-1 text-sm border rounded ${
                                          theme === 'dark' 
                                            ? 'bg-gray-700 border-gray-500 text-white' 
                                            : 'bg-white border-gray-300'
                                        }`}
                                        placeholder='Notes'
                                        rows={2}
                                      />
                                      <div className='flex gap-2'>
                                        <Button
                                          size='sm'
                                          onClick={saveOpportunityEdit}
                                        >
                                          <Save className='w-3 h-3 mr-1' />
                                          Save
                                        </Button>
                                        <Button
                                          size='sm'
                                          variant='outline'
                                          onClick={cancelOpportunityEdit}
                                        >
                                          <X className='w-3 h-3 mr-1' />
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className='flex justify-between items-start mb-2'>
                                        <h4 
                                          className={`font-semibold ${
                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                          }`}
                                        >
                                          {opportunity.name}
                                        </h4>
                                        <div className='flex gap-1'>
                                          <Button
                                            size='sm'
                                            variant='ghost'
                                            onClick={() =>
                                              startEditOpportunity(
                                                opportunity.id
                                              )
                                            }
                                          >
                                            <Edit2 className='w-3 h-3' />
                                          </Button>
                                          <Button
                                            size='sm'
                                            variant='ghost'
                                            onClick={() =>
                                              deleteOpportunity(opportunity.id)
                                            }
                                          >
                                            <Trash2 className='w-3 h-3' />
                                          </Button>
                                        </div>
                                      </div>

                                      <p 
                                        className={`text-sm mb-2 ${
                                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                      >
                                        {opportunity.details}
                                      </p>

                                      <div 
                                        className={`flex items-center gap-4 text-sm mb-2 ${
                                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                        }`}
                                      >
                                        <div className='flex items-center gap-1'>
                                          <DollarSign className='w-3 h-3' />
                                          <span className='font-semibold text-green-600'>
                                            {formatCurrency(opportunity.value)}
                                          </span>
                                        </div>
                                        {opportunity.client && (
                                          <div className='flex items-center gap-1'>
                                            <User className='w-3 h-3' />
                                            <span>
                                              {opportunity.client.name}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {opportunity.notes && (
                                        <div className='text-xs text-gray-500 bg-gray-50 p-2 rounded'>
                                          <FileText className='w-3 h-3 inline mr-1' />
                                          {opportunity.notes}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          )
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div 
            className={`rounded-lg p-6 w-96 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 
              className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Create New Client
            </h3>
            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Client Name'
                value={newClient.name}
                onChange={e =>
                  setNewClient(prev => ({ ...prev, name: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type='email'
                placeholder='Email'
                value={newClient.email}
                onChange={e =>
                  setNewClient(prev => ({ ...prev, email: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type='tel'
                placeholder='Phone'
                value={newClient.phone}
                onChange={e =>
                  setNewClient(prev => ({ ...prev, phone: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <input
                type='text'
                placeholder='Company'
                value={newClient.company}
                onChange={e =>
                  setNewClient(prev => ({ ...prev, company: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>
            <div className='flex gap-2 mt-6'>
              <Button onClick={createNewClient} className='flex-1'>
                Create Client
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowNewClientModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Opportunity Modal */}
      {showNewOpportunityModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div 
            className={`rounded-lg p-6 w-96 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h3 
              className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              Create New Opportunity
            </h3>
            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Opportunity Name'
                value={newOpportunity.name}
                onChange={e =>
                  setNewOpportunity(prev => ({ ...prev, name: e.target.value }))
                }
                className={`w-full px-3 py-2 border rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <textarea
                placeholder='Opportunity Details'
                value={newOpportunity.details}
                onChange={e =>
                  setNewOpportunity(prev => ({
                    ...prev,
                    details: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                rows={3}
              />
              <input
                type='number'
                placeholder='Value'
                value={newOpportunity.value}
                onChange={e =>
                  setNewOpportunity(prev => ({
                    ...prev,
                    value: Number(e.target.value),
                  }))
                }
                className={`w-full px-3 py-2 border rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
              <div className='flex gap-2'>
                <select
                  value={newOpportunity.clientId}
                  onChange={e =>
                    setNewOpportunity(prev => ({
                      ...prev,
                      clientId: e.target.value,
                    }))
                  }
                  className={`flex-1 px-3 py-2 border rounded ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-500 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value=''>Select Client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.company})
                    </option>
                  ))}
                </select>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setShowNewClientModal(true)}
                  className='px-3 py-2'
                >
                  <Plus className='w-4 h-4' />
                </Button>
              </div>
              <textarea
                placeholder='Notes'
                value={newOpportunity.notes}
                onChange={e =>
                  setNewOpportunity(prev => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-500 text-white' 
                    : 'bg-white border-gray-300'
                }`}
                rows={2}
              />
            </div>
            <div className='flex gap-2 mt-6'>
              <Button onClick={createNewOpportunity} className='flex-1'>
                Create Opportunity
              </Button>
              <Button
                variant='outline'
                onClick={() => setShowNewOpportunityModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
