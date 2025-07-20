import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  User,
  Building,
  Calendar,
  DollarSign,
  Tag,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface Opportunity {
  activities?: Array<{
    date: string;
    id: string;
    notes?: string;
    status: 'completed' | 'pending' | 'overdue';
    title: string;
    type: 'call' | 'email' | 'meeting' | 'task';
}>;
  avatarUrl?: string;
  company: string;
  contacts?: Array<{
    email: string;
    id: string;
    name: string;
    phone: string;
    role: string;
  }>;
  createdAt: string;
  description?: string;
  documents?: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
  }>;
  expectedCloseDate?: string;
  id: string;
  industry?: string;
  lastContact?: string;
  nextAction?: string;
  notes?: Array<{
    author: string;
    content: string;
    createdAt: string;
    id: string;
  }>;
  owner: string;
  probability?: number;
  source?: string;
  stage: string;
  status?: string;
  tags?: string[];
  title: string;
  value: number;
}

interface PipelineColumn {
  color?: string;
  id: string;
  name: string;
  opportunities: Opportunity[];
}

interface DragState {
  draggedItem: { id: string; sourceColumn: string; sourceIndex: number } | null;
  dropTarget: { columnId: string; index: number } | null;
  isDragging: boolean;
}

interface SalesPipelineProps {
  onNavigateToModule?: (module: string, params?: Record<string, unknown>) => void;
}

const SalesPipeline: React.FC<SalesPipelineProps> = ({ onNavigateToModule }) => {
  // Load initial data from localStorage or use default data
  const loadInitialColumns = (): PipelineColumn[] => {
    try {
      const savedData = localStorage.getItem('salesPipelineData');
      if (savedData) {
        const parsed = JSON.parse(savedData) as PipelineColumn[];
        console.log('Loaded saved pipeline data:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading saved pipeline data:', error);
    }
    
    // Return default data if no saved data exists
    return [
      {
        id: 'lead',
        name: 'Lead',
        color: '#3B82F6',
        opportunities: [
          {
            id: '1',
            title: 'Enterprise CRM Implementation',
            value: 125000,
            company: 'TechCorp Solutions',
            owner: 'Sarah Johnson',
            stage: 'Lead',
            probability: 25,
            createdAt: '2024-01-15',
            expectedCloseDate: '2024-06-30',
            description: 'Large-scale CRM implementation for enterprise client',
            source: 'Website',
            industry: 'Technology'
          },
          {
            id: '2',
            title: 'Cloud Migration Project',
            value: 85000,
            company: 'DataFlow Systems',
            owner: 'Mike Chen',
            stage: 'Lead',
            probability: 30,
            createdAt: '2024-01-20',
            expectedCloseDate: '2024-05-15',
            description: 'Legacy system migration to cloud infrastructure',
            source: 'Referral',
            industry: 'Finance'
          },
          {
            id: '3',
            title: 'Digital Marketing Campaign',
            value: 45000,
            company: 'Growth Marketing Co',
            owner: 'Mike Wilson',
            stage: 'Lead',
            probability: 25,
            createdAt: '2024-06-03',
            expectedCloseDate: '2024-07-01',
            description: 'Comprehensive digital marketing campaign including SEO, PPC, and social media.',
            source: 'Website',
            industry: 'Marketing'
          }
        ]
      },
      {
        id: 'qualified',
        name: 'Qualified',
        color: '#10B981',
        opportunities: [
          {
            id: '4',
            title: 'Digital Transformation Initiative',
            value: 200000,
            company: 'Global Manufacturing Inc',
            owner: 'Emily Rodriguez',
            stage: 'Qualified',
            probability: 50,
            createdAt: '2024-01-10',
            expectedCloseDate: '2024-07-31',
            description: 'End-to-end digital transformation project',
            source: 'Trade Show',
            industry: 'Manufacturing'
          },
          {
            id: '5',
            title: 'Cloud Infrastructure Setup',
            value: 65000,
            company: 'Legacy Systems Ltd',
            owner: 'David Lee',
            stage: 'Qualified',
            probability: 55,
            createdAt: '2024-05-25',
            expectedCloseDate: '2024-09-15',
            description: 'Migration of legacy systems to cloud infrastructure.',
            source: 'Industry Event',
            industry: 'Technology'
          }
        ]
      },
      {
        id: 'proposal',
        name: 'Proposal',
        color: '#F59E0B',
        opportunities: [
          {
            id: '6',
            title: 'AI-Powered Analytics Platform',
            value: 150000,
            company: 'InnovateTech',
            owner: 'David Kim',
            stage: 'Proposal',
            probability: 75,
            createdAt: '2024-01-05',
            expectedCloseDate: '2024-04-30',
            description: 'Custom AI analytics solution for data insights',
            source: 'Cold Call',
            industry: 'Healthcare'
          },
          {
            id: '7',
            title: 'Data Analytics Dashboard',
            value: 35000,
            company: 'Data Insights Co',
            owner: 'Lisa Chen',
            stage: 'Proposal',
            probability: 70,
            createdAt: '2024-05-15',
            expectedCloseDate: '2024-08-30',
            description: 'Advanced data analytics platform with machine learning capabilities.',
            source: 'Referral',
            industry: 'Data & Analytics'
          }
        ]
      },
      {
        id: 'negotiation',
        name: 'Negotiation',
        color: '#EF4444',
        opportunities: [
          {
            id: '8',
            title: 'E-commerce Platform Development',
            value: 95000,
            company: 'Retail Solutions Co',
            owner: 'Lisa Wang',
            stage: 'Negotiation',
            probability: 90,
            createdAt: '2024-01-01',
            expectedCloseDate: '2024-03-31',
            description: 'Custom e-commerce platform with payment integration',
            source: 'Partner',
            industry: 'Retail'
          },
          {
            id: '9',
            title: 'Cloud Infrastructure',
            value: 120000,
            company: 'CloudTech Ltd',
            owner: 'Rachel Green',
            stage: 'Negotiation',
            probability: 85,
            createdAt: '2024-05-15',
            expectedCloseDate: '2024-07-30',
            description: 'Enterprise cloud infrastructure setup and management.',
            source: 'Partner Referral',
            industry: 'Technology'
          }
        ]
      },
      {
        id: 'closed-won',
        name: 'Closed Won',
        color: '#8B5CF6',
        opportunities: [
          {
            id: '10',
            title: 'Mobile App Development',
            value: 75000,
            company: 'StartupXYZ',
            owner: 'Alex Thompson',
            stage: 'Closed Won',
            probability: 100,
            createdAt: '2023-12-15',
            expectedCloseDate: '2024-02-28',
            description: 'Cross-platform mobile application development',
            source: 'Website',
            industry: 'Startup'
          },
          {
            id: '11',
            title: 'Data Analytics Dashboard',
            value: 35000,
            company: 'Data Insights Co',
            owner: 'David Lee',
            stage: 'Closed Won',
            probability: 100,
            createdAt: '2024-04-30',
            expectedCloseDate: '2024-06-30',
            description: 'Custom data analytics dashboard for business intelligence.',
            source: 'Referral',
            industry: 'Data & Analytics'
          }
        ]
      }
    ];
  };

  const [columns, setColumns] = useState<PipelineColumn[]>(loadInitialColumns);

  // Function to save data to localStorage
  const saveToLocalStorage = (newColumns: PipelineColumn[]): void => {
    try {
      localStorage.setItem('salesPipelineData', JSON.stringify(newColumns));
      console.log('Saved pipeline data to localStorage');
    } catch (error) {
      console.error('Error saving pipeline data:', error);
    }
  };

  // Wrapper function for setColumns that also saves to localStorage
  const updateColumns = (updater: (prevColumns: PipelineColumn[]) => PipelineColumn[]): void => {
    setColumns(prevColumns => {
      const newColumns = updater(prevColumns);
      saveToLocalStorage(newColumns);
      return newColumns;
    });
  };

  // Function to clear saved data (for debugging/testing)
  const clearSavedData = (): void => {
    try {
      localStorage.removeItem('salesPipelineData');
      console.log('Cleared saved pipeline data');
      // Reload the page to reset to default data
      window.location.reload();
    } catch (error) {
      console.error('Error clearing saved data:', error);
    }
  };

  const [dragState, setDragState] = useState<DragState>({
    draggedItem: null,
    dropTarget: null,
    isDragging: false
  });

  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showColumnMenu, setShowColumnMenu] = useState<string | null>(null);
  const [showColumnRename, setShowColumnRename] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');
  const [isAddingOpportunity, setIsAddingOpportunity] = useState(false);
  const [isDeletingOpportunity, setIsDeletingOpportunity] = useState(false);
  const kanbanRef = useRef<HTMLDivElement>(null);
  const isAddingRef = useRef(false);
  const isDeletingRef = useRef(false);
  const lastClickTime = useRef(0);
  const operationInProgress = useRef(false);

  // Debounced click handler to prevent rapid successive clicks
  const debouncedClick = (handler: () => void, delay = 300): void => {
    const now = Date.now();
    if (now - lastClickTime.current < delay) {
      console.log('Click debounced, too soon since last click');
      return;
    }
    lastClickTime.current = now;
    console.log('Executing debounced click handler');
    handler();
  };

  // Handle ESC key to close modal (but not during deletion)
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && showOpportunityModal && !isDeletingOpportunity) {
        setShowOpportunityModal(false);
        setSelectedOpportunity(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showOpportunityModal, isDeletingOpportunity]);

  // Cleanup refs when component unmounts or state changes
  useEffect(() => {
    return () => {
      isAddingRef.current = false;
      isDeletingRef.current = false;
      operationInProgress.current = false;
    };
  }, []);

  // Reset refs when state changes
  useEffect(() => {
    if (!isAddingOpportunity) {
      isAddingRef.current = false;
    }
  }, [isAddingOpportunity]);

  useEffect(() => {
    if (!isDeletingOpportunity) {
      isDeletingRef.current = false;
    }
  }, [isDeletingOpportunity]);

  // Reset operation flag when both operations are complete
  useEffect(() => {
    if (!isAddingOpportunity && !isDeletingOpportunity) {
      operationInProgress.current = false;
    }
  }, [isAddingOpportunity, isDeletingOpportunity]);

  // Calculate total pipeline value
  const totalPipelineValue = columns.reduce((total, col) => 
    total + col.opportunities.reduce((sum, opp) => sum + opp.value, 0), 0
  );

  // Handle drag and drop with improved logic to prevent flickering
  const handleDragStart = (e: React.DragEvent, opportunityId: string, sourceColumn: string, sourceIndex: number): void => {
    setDragState({
      draggedItem: { id: opportunityId, sourceColumn, sourceIndex },
      dropTarget: null,
      isDragging: true
    });
    e.dataTransfer.effectAllowed = 'move';
    document.body.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, columnId: string): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const cardHeight = 140; // Approximate card height with margin
    const containerPadding = 16; // Padding from container
    const adjustedY = y - containerPadding;
    
    // Calculate the correct index based on mouse position
    let index = Math.floor(adjustedY / cardHeight);
    const column = columns.find(col => col.id === columnId);
    const maxIndex = column?.opportunities.length ?? 0;
    index = Math.max(0, Math.min(index, maxIndex));
    
    setDragState(prev => ({
      ...prev,
      dropTarget: { columnId, index }
    }));
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    // Only clear drop target if we're actually leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dropTarget: null
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string): void => {
    e.preventDefault();
    if (!dragState.draggedItem || !dragState.dropTarget) return;
    
    const { id: opportunityId, sourceColumn, sourceIndex } = dragState.draggedItem;
    const { index: targetIndex } = dragState.dropTarget;
    
    updateColumns(prevColumns => {
      const newColumns = [...prevColumns];
      
      // Find source and target columns
      const sourceColIndex = newColumns.findIndex(col => col.id === sourceColumn);
      const targetColIndex = newColumns.findIndex(col => col.id === targetColumn);
      
      if (sourceColIndex === -1 || targetColIndex === -1) return prevColumns;
      
      const sourceCol = newColumns[sourceColIndex];
      const targetCol = newColumns[targetColIndex];
      
      if (!sourceCol || !targetCol) return prevColumns;
      
      // Find the opportunity in source column
      const opportunityIndex = sourceCol.opportunities.findIndex(opp => opp.id === opportunityId);
      if (opportunityIndex === -1) return prevColumns;
      
      // Remove from source column
      const opportunities = sourceCol.opportunities.splice(opportunityIndex, 1);
      const opportunity = opportunities[0];
      
      if (!opportunity) return prevColumns;
      
      // Update opportunity stage
      opportunity.stage = targetCol.id;
      
      // Add to target column at the correct position
      const finalTargetIndex = Math.min(targetIndex, targetCol.opportunities.length);
      targetCol.opportunities.splice(finalTargetIndex, 0, opportunity);
      
      return newColumns;
    });
    
    setDragState({
      draggedItem: null,
      dropTarget: null,
      isDragging: false,
    });
    
    document.body.classList.remove('dragging');
  };

  const handleDragEnd = (): void => {
    setDragState({
      draggedItem: null,
      dropTarget: null,
      isDragging: false,
    });
    
    document.body.classList.remove('dragging');
  };

  const handleAddOpportunity = (): void => {
    console.log('handleAddOpportunity called');
    
    // Use a global operation flag to prevent any concurrent operations
    if (operationInProgress.current) {
      console.log('Operation already in progress, skipping');
      return;
    }
    
    console.log('Adding new opportunity');
    operationInProgress.current = true;
    isAddingRef.current = true;
    setIsAddingOpportunity(true);
    
    // Use crypto.randomUUID for unique ID, fallback to robust random string
    let uniqueId = '';
    if (window.crypto && window.crypto.randomUUID) {
      uniqueId = `opp_${window.crypto.randomUUID()}`;
    } else {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      uniqueId = `opp_${timestamp}_${randomStr}`;
    }
    
    const newOpportunity: Opportunity = {
      id: uniqueId,
      title: 'New Opportunity',
      value: 50000,
      company: 'New Company',
      owner: 'Current User',
      stage: 'Lead',
      probability: 25,
      createdAt: new Date().toISOString().split('T')[0] || new Date().toLocaleDateString(),
      expectedCloseDate: '2024-12-31',
      description: 'New opportunity description',
      source: 'Manual',
      industry: 'Technology'
    };

    console.log('Creating new opportunity with ID:', uniqueId);

    updateColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const leadColumn = newColumns.find(col => col.id === 'lead');
      if (leadColumn) {
        // Only add if this ID does not already exist (idempotent)
        if (!leadColumn.opportunities.some(opp => opp.id === uniqueId)) {
          leadColumn.opportunities.unshift(newOpportunity);
          console.log('Added opportunity to lead column:', newOpportunity.id);
        } else {
          console.log('Duplicate add prevented for ID:', uniqueId);
        }
      }
      return newColumns;
    });

    // Reset flags immediately
    setIsAddingOpportunity(false);
    isAddingRef.current = false;
    operationInProgress.current = false;
  };

  const handleOpportunityClick = (opportunity: Opportunity): void => {
    setSelectedOpportunity(opportunity);
    setShowOpportunityModal(true);
  };

  const handleOpportunityUpdate = (updatedOpportunity: Opportunity): void => {
    updateColumns(prevColumns => 
      prevColumns.map(col => ({
        ...col,
        opportunities: col.opportunities.map(opp => 
          opp.id === updatedOpportunity.id ? updatedOpportunity : opp
        )
      }))
    );
  };

  const handleOpportunityDelete = (id: string): void => {
    console.log('handleOpportunityDelete called for ID:', id);
    
    // Use a global operation flag to prevent any concurrent operations
    if (operationInProgress.current) {
      console.log('Operation already in progress, skipping');
      return;
    }
    
    console.log('Starting delete operation for opportunity:', id);
    operationInProgress.current = true;
    isDeletingRef.current = true;
    setIsDeletingOpportunity(true);
    
    updateColumns(prevColumns => {
      const newColumns = prevColumns.map(col => {
        // Only update if the opportunity exists (idempotent)
        if (col.opportunities.some(opp => opp.id === id)) {
          return {
            ...col,
            opportunities: col.opportunities.filter(opp => opp.id !== id)
          };
        }
        return col;
      });
      console.log('Updated columns after delete:', newColumns);
      return newColumns;
    });

    // Close modal and reset state immediately
    setShowOpportunityModal(false);
    setSelectedOpportunity(null);
    setIsDeletingOpportunity(false);
    isDeletingRef.current = false;
    operationInProgress.current = false;
  };

  const handleColumnRename = (columnId: string, newName: string): void => {
    if (newName.trim()) {
      updateColumns(prevColumns => 
        prevColumns.map(col => 
          col.id === columnId ? { ...col, name: newName.trim() } : col
        )
      );
    }
    setShowColumnRename(null);
    setEditingColumnName('');
  };

  const renderOpportunityCard = (opp: Opportunity, index: number, columnId: string): JSX.Element => {
    const isDragged = dragState.draggedItem?.id === opp.id;
    const isDropTarget = dragState.dropTarget?.columnId === columnId && dragState.dropTarget?.index === index;
    
    return (
      <div
        key={opp.id}
        className={`kanban-card bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 transform hover:-translate-y-1 ${
          isDragged ? 'opacity-30 scale-95 rotate-1 shadow-xl' : ''
        } ${isDropTarget ? 'ring-2 ring-constructbms-blue ring-opacity-30' : ''} ${
          isDeletingOpportunity ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:shadow-lg'
        }`}
        draggable={!isDeletingOpportunity}
        onDragStart={(e) => handleDragStart(e, opp.id, columnId, index)}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (!isDeletingOpportunity) {
            debouncedClick(() => handleOpportunityClick(opp));
          }
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
            {opp.title}
          </h3>
          <div className="flex items-center gap-1">
            {opp.status === 'hot' && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
            {opp.status === 'warm' && <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>}
            {opp.status === 'cold' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
          </div>
        </div>

        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Building className="h-3 w-3" />
            <span className="truncate">{opp.company}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3" />
            <span className="font-medium text-constructbms-blue">£{opp.value.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span className="truncate">{opp.owner}</span>
          </div>
        </div>

        {opp.tags && opp.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {opp.tags.slice(0, 2).map((tag, tagIndex) => (
              <span
                key={tagIndex}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {opp.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                +{opp.tags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Fixed Header - Independent of kanban scroll, always left-aligned */}
      <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Sales Pipeline</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage your sales opportunities and track progress</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-2"
              title="Card Settings"
            >
              <Settings size={16} />
              <span className="hidden sm:inline">Card Settings</span>
            </button>
            <div className="text-right">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Pipeline Value</div>
              <div className="text-sm sm:text-lg font-semibold text-constructbms-blue">
                £{totalPipelineValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board - Only the columns scroll horizontally */}
      <div className="w-full overflow-x-auto bg-gray-50 dark:bg-gray-900" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div 
          ref={kanbanRef}
          className="flex flex-row gap-4 sm:gap-6 py-4 sm:py-6 px-4 sm:px-6 w-full overflow-x-auto"
        >
          {columns.map((column, colIdx) => (
            <div
              key={column.id}
              className="kanban-column min-w-[250px] max-w-[320px] flex-shrink-0 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: column.color }}
                  />
                  {showColumnRename === column.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingColumnName}
                        onChange={(e) => setEditingColumnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleColumnRename(column.id, editingColumnName);
                          } else if (e.key === 'Escape') {
                            setShowColumnRename(null);
                            setEditingColumnName('');
                          }
                        }}
                        onBlur={() => {
                          if (editingColumnName.trim()) {
                            handleColumnRename(column.id, editingColumnName);
                          } else {
                            setShowColumnRename(null);
                            setEditingColumnName('');
                          }
                        }}
                        className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-constructbms-blue outline-none"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <h2 
                      className="text-lg font-bold text-gray-900 dark:text-white cursor-pointer hover:text-constructbms-blue transition-colors"
                      onClick={() => {
                        setShowColumnRename(column.id);
                        setEditingColumnName(column.name);
                      }}
                      title="Click to rename"
                    >
                      {column.name}
                    </h2>
                  )}
                  <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {column.opportunities.length}
                  </span>
                </div>
                <div className="relative">
                  <button 
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={clearSavedData}
                    title="Clear Saved Data"
                  >
                    <Trash2 className="h-5 w-5 text-gray-400" />
                  </button>
                  <button 
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setShowColumnMenu(showColumnMenu === column.id ? null : column.id)}
                    title="Column Options"
                  >
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                  
                  {/* Column Menu */}
                  {showColumnMenu === column.id && (
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10 min-w-[160px]">
                      <button
                        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors"
                        onClick={() => {
                          setShowColumnRename(column.id);
                          setEditingColumnName(column.name);
                          setShowColumnMenu(null);
                        }}
                        title="Rename Column"
                      >
                        <Edit3 className="h-4 w-4" />
                        Rename Column
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Add New Opportunity Button (only in first column) */}
              {colIdx === 0 && (
                <button 
                  className={`flex items-center gap-2 m-4 px-3 py-2 rounded-lg font-medium shadow transition-colors ${
                    isAddingOpportunity 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-constructbms-blue text-black hover:bg-constructbms-primary'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddOpportunity();
                  }}
                  disabled={isAddingOpportunity}
                  title={isAddingOpportunity ? "Adding..." : "Add New Opportunity"}
                >
                  <Plus className="h-4 w-4" /> 
                  {isAddingOpportunity ? 'Adding...' : 'Add New Opportunity'}
                </button>
              )}

              {/* Opportunity Cards Container */}
              <div 
                className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {column.opportunities.map((opp, index) => (
                  <React.Fragment key={opp.id}>
                    {/* Drop Zone Indicator before this card */}
                    {dragState.isDragging && 
                     dragState.dropTarget?.columnId === column.id && 
                     dragState.dropTarget?.index === index && (
                      <div className="drop-zone-space mb-2">
                        <div className="h-16 bg-constructbms-blue/10 border-2 border-dashed border-constructbms-blue rounded-lg flex items-center justify-center">
                          <div className="text-constructbms-blue text-xs font-medium">Drop here</div>
                        </div>
                      </div>
                    )}
                    
                    {renderOpportunityCard(opp, index, column.id)}
                  </React.Fragment>
                ))}
                
                {/* Drop Zone Indicator at the end */}
                {dragState.isDragging && 
                 dragState.dropTarget?.columnId === column.id && 
                 dragState.dropTarget?.index === column.opportunities.length && (
                  <div className="drop-zone-space mt-2">
                    <div className="h-16 bg-constructbms-blue/10 border-2 border-dashed border-constructbms-blue rounded-lg flex items-center justify-center">
                      <div className="text-constructbms-blue text-xs font-medium">Drop here</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Simple Opportunity Details Modal */}
      {showOpportunityModal && selectedOpportunity && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingOpportunity) {
              setShowOpportunityModal(false);
              setSelectedOpportunity(null);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedOpportunity.title}
                </h2>
                <button
                  onClick={() => {
                    if (!isDeletingOpportunity) {
                      setShowOpportunityModal(false);
                      setSelectedOpportunity(null);
                    }
                  }}
                  disabled={isDeletingOpportunity}
                  className={`${isDeletingOpportunity ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Opportunity Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedOpportunity.company}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        £{selectedOpportunity.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedOpportunity.owner}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Expected: {selectedOpportunity.expectedCloseDate || 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Status & Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{selectedOpportunity.stage}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {selectedOpportunity.probability || 0}% probability
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">
                        Last contact: {selectedOpportunity.lastContact || 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOpportunity.description && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOpportunity.description}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (!isDeletingOpportunity) {
                      // Handle edit
                      setShowOpportunityModal(false);
                      setSelectedOpportunity(null);
                    }
                  }}
                  disabled={isDeletingOpportunity}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                    isDeletingOpportunity 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-constructbms-blue text-black hover:bg-constructbms-primary'
                  }`}
                >
                  Edit Opportunity
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Delete button clicked for opportunity:', selectedOpportunity.id);
                    handleOpportunityDelete(selectedOpportunity.id);
                  }}
                  disabled={isDeletingOpportunity}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                    isDeletingOpportunity 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isDeletingOpportunity ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPipeline;
