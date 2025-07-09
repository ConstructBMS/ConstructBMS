import React, { useState, useEffect } from 'react';
import {
  Link,
  User,
  Briefcase,
  Target,
  Building,
  Search,
  Plus,
  CheckCircle,
  X,
  AlertCircle,
  Info,
  ExternalLink,
  Calendar,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Clock,
  ChevronRight,
  ChevronDown,
  Star,
  Tag,
  MessageCircle,
} from 'lucide-react';

// CRM Entity Types
interface CRMEntity {
  id: string;
  type: 'customer' | 'project' | 'opportunity' | 'contractor';
  name: string;
  email?: string;
  phone?: string;
  status: string;
  lastContact?: Date;
  value?: number;
  description?: string;
  tags?: string[];
  confidence: number;
  linkedEmails?: number;
}

interface EmailLink {
  id: string;
  emailId: string;
  entityId: string;
  entityType: string;
  linkType: 'manual' | 'auto' | 'suggested';
  confidence: number;
  createdAt: Date;
}

interface EntitySuggestion {
  entity: CRMEntity;
  reason: string;
  confidence: number;
  suggestedActions: string[];
}

const CRMIntegration: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  emailId?: string;
  emailContent?: string;
  emailSubject?: string;
  senderEmail?: string;
}> = ({
  isOpen,
  onClose,
  emailId,
  emailContent,
  emailSubject,
  senderEmail,
}) => {
  const [selectedTab, setSelectedTab] = useState<
    'linked' | 'suggestions' | 'search'
  >('linked');
  const [linkedEntities, setLinkedEntities] = useState<CRMEntity[]>([]);
  const [suggestions, setSuggestions] = useState<EntitySuggestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CRMEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && emailId) {
      loadLinkedEntities();
      generateSuggestions();
    }
  }, [isOpen, emailId]);

  const loadLinkedEntities = () => {
    // Simulate loading linked entities
    const entities: CRMEntity[] = [
      {
        id: 'cust_1',
        type: 'customer',
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.com',
        phone: '+44 20 7123 4567',
        status: 'Active',
        lastContact: new Date(),
        value: 50000,
        description:
          'Technology consulting firm specializing in digital transformation',
        tags: ['Technology', 'Consulting', 'Enterprise'],
        confidence: 0.95,
        linkedEmails: 23,
      },
      {
        id: 'proj_1',
        type: 'project',
        name: 'Website Redesign Project',
        status: 'In Progress',
        lastContact: new Date(),
        value: 25000,
        description: 'Complete website redesign and development for TechCorp',
        tags: ['Web Development', 'Design', 'Active'],
        confidence: 0.88,
        linkedEmails: 15,
      },
    ];
    setLinkedEntities(entities);
  };

  const generateSuggestions = () => {
    if (!emailContent || !emailSubject || !senderEmail) return;

    const content = (emailContent + ' ' + emailSubject).toLowerCase();
    const suggestions: EntitySuggestion[] = [];

    // Check for customer matches
    const customerMatch = findCustomerMatch(senderEmail, content);
    if (customerMatch) {
      suggestions.push({
        entity: customerMatch,
        reason: 'Email sender matches customer record',
        confidence: 0.9,
        suggestedActions: [
          'Link to customer',
          'Update contact info',
          'Create follow-up task',
        ],
      });
    }

    // Check for project references
    const projectMatch = findProjectMatch(content);
    if (projectMatch) {
      suggestions.push({
        entity: projectMatch,
        reason: 'Email content mentions project',
        confidence: 0.8,
        suggestedActions: [
          'Link to project',
          'Update project status',
          'Create project task',
        ],
      });
    }

    // Check for opportunity references
    const opportunityMatch = findOpportunityMatch(content);
    if (opportunityMatch) {
      suggestions.push({
        entity: opportunityMatch,
        reason: 'Email discusses business opportunity',
        confidence: 0.7,
        suggestedActions: [
          'Link to opportunity',
          'Update opportunity status',
          'Schedule follow-up',
        ],
      });
    }

    setSuggestions(suggestions);
  };

  const findCustomerMatch = (
    senderEmail: string,
    content: string
  ): CRMEntity | null => {
    const knownCustomers = [
      {
        id: 'cust_1',
        type: 'customer' as const,
        name: 'TechCorp Solutions',
        email: 'contact@techcorp.com',
        phone: '+44 20 7123 4567',
        status: 'Active',
        lastContact: new Date(),
        value: 50000,
        description: 'Technology consulting firm',
        tags: ['Technology', 'Consulting'],
        confidence: 0.9,
        linkedEmails: 23,
      },
      {
        id: 'cust_2',
        type: 'customer' as const,
        name: 'BuildPro Construction',
        email: 'info@buildpro.com',
        phone: '+44 20 7123 4568',
        status: 'Active',
        lastContact: new Date(),
        value: 75000,
        description: 'Construction and development company',
        tags: ['Construction', 'Development'],
        confidence: 0.85,
        linkedEmails: 18,
      },
    ];

    const customer = knownCustomers.find(c =>
      senderEmail.includes(c.email.split('@')[1])
    );
    if (customer) {
      return customer;
    }

    // Check content for customer names
    for (const customer of knownCustomers) {
      if (content.includes(customer.name.toLowerCase().split(' ')[0])) {
        return customer;
      }
    }

    return null;
  };

  const findProjectMatch = (content: string): CRMEntity | null => {
    const projectMatch = content.match(/project[:\s]+([a-zA-Z0-9\s]+)/i);
    if (projectMatch) {
      const projectName = projectMatch[1].trim();

      const knownProjects = [
        {
          id: 'proj_1',
          type: 'project' as const,
          name: 'Website Redesign Project',
          status: 'In Progress',
          lastContact: new Date(),
          value: 25000,
          description: 'Complete website redesign',
          tags: ['Web Development', 'Design'],
          confidence: 0.8,
          linkedEmails: 15,
        },
        {
          id: 'proj_2',
          type: 'project' as const,
          name: 'Mobile App Development',
          status: 'Planning',
          lastContact: new Date(),
          value: 40000,
          description: 'iOS and Android app development',
          tags: ['Mobile', 'Development'],
          confidence: 0.75,
          linkedEmails: 8,
        },
      ];

      const matchingProject = knownProjects.find(p =>
        projectName.toLowerCase().includes(p.name.toLowerCase().split(' ')[1])
      );

      if (matchingProject) {
        return matchingProject;
      }
    }

    return null;
  };

  const findOpportunityMatch = (content: string): CRMEntity | null => {
    const opportunityMatch = content.match(
      /(?:opportunity|deal|proposal)[:\s]+([a-zA-Z0-9\s]+)/i
    );
    if (opportunityMatch) {
      const opportunityName = opportunityMatch[1].trim();

      const knownOpportunities = [
        {
          id: 'opp_1',
          type: 'opportunity' as const,
          name: 'Cloud Migration Opportunity',
          status: 'Qualified',
          lastContact: new Date(),
          value: 100000,
          description: 'Enterprise cloud migration project',
          tags: ['Cloud', 'Enterprise'],
          confidence: 0.7,
          linkedEmails: 12,
        },
        {
          id: 'opp_2',
          type: 'opportunity' as const,
          name: 'Digital Transformation',
          status: 'Prospecting',
          lastContact: new Date(),
          value: 150000,
          description: 'Digital transformation consulting',
          tags: ['Consulting', 'Transformation'],
          confidence: 0.65,
          linkedEmails: 6,
        },
      ];

      const matchingOpportunity = knownOpportunities.find(o =>
        opportunityName
          .toLowerCase()
          .includes(o.name.toLowerCase().split(' ')[0])
      );

      if (matchingOpportunity) {
        return matchingOpportunity;
      }
    }

    return null;
  };

  const searchEntities = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);

    // Simulate search
    setTimeout(() => {
      const results: CRMEntity[] = [
        {
          id: 'cust_3',
          type: 'customer',
          name: 'InnovateTech',
          email: 'hello@innovatetech.com',
          status: 'Active',
          lastContact: new Date(),
          value: 30000,
          confidence: 0.6,
          linkedEmails: 5,
        },
        {
          id: 'proj_3',
          type: 'project',
          name: 'E-commerce Platform',
          status: 'Completed',
          lastContact: new Date(),
          value: 35000,
          confidence: 0.5,
          linkedEmails: 3,
        },
      ];

      setSearchResults(results);
      setIsLoading(false);
    }, 500);
  };

  const linkEntity = (entity: CRMEntity) => {
    // Add entity to linked entities
    setLinkedEntities(prev => [...prev, entity]);

    // Remove from suggestions
    setSuggestions(prev => prev.filter(s => s.entity.id !== entity.id));

    // Remove from search results
    setSearchResults(prev => prev.filter(e => e.id !== entity.id));
  };

  const unlinkEntity = (entityId: string) => {
    setLinkedEntities(prev => prev.filter(e => e.id !== entityId));
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'customer':
        return User;
      case 'project':
        return Briefcase;
      case 'opportunity':
        return Target;
      case 'contractor':
        return Building;
      default:
        return User;
    }
  };

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'customer':
        return 'text-blue-600 bg-blue-50';
      case 'project':
        return 'text-green-600 bg-green-50';
      case 'opportunity':
        return 'text-purple-600 bg-purple-50';
      case 'contractor':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <Link className='w-6 h-6 text-archer-neon' />
            <h2 className='text-xl font-semibold'>CRM Integration</h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <span className='text-xl'>&times;</span>
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-gray-200'>
          <button
            onClick={() => setSelectedTab('linked')}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === 'linked'
                ? 'text-archer-neon border-b-2 border-archer-neon'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Linked Entities ({linkedEntities.length})
          </button>
          <button
            onClick={() => setSelectedTab('suggestions')}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === 'suggestions'
                ? 'text-archer-neon border-b-2 border-archer-neon'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            AI Suggestions ({suggestions.length})
          </button>
          <button
            onClick={() => setSelectedTab('search')}
            className={`px-6 py-3 font-medium transition-colors ${
              selectedTab === 'search'
                ? 'text-archer-neon border-b-2 border-archer-neon'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Search & Link
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          {/* Linked Entities Tab */}
          {selectedTab === 'linked' && (
            <div className='space-y-4'>
              {linkedEntities.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Link className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p>No entities linked to this email</p>
                  <p className='text-sm'>
                    Use AI suggestions or search to link entities
                  </p>
                </div>
              ) : (
                linkedEntities.map(entity => {
                  const EntityIcon = getEntityIcon(entity.type);
                  return (
                    <div
                      key={entity.id}
                      className='border border-gray-200 rounded-lg p-4'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start space-x-3'>
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEntityColor(entity.type)}`}
                          >
                            <EntityIcon className='w-5 h-5' />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-2 mb-1'>
                              <h3 className='font-semibold text-gray-900'>
                                {entity.name}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded ${getEntityColor(entity.type)}`}
                              >
                                {entity.type}
                              </span>
                              <span className='text-xs text-gray-500'>
                                {entity.linkedEmails} emails
                              </span>
                            </div>

                            {entity.description && (
                              <p className='text-sm text-gray-600 mb-2'>
                                {entity.description}
                              </p>
                            )}

                            <div className='flex items-center space-x-4 text-xs text-gray-500'>
                              {entity.email && (
                                <div className='flex items-center space-x-1'>
                                  <Mail className='w-3 h-3' />
                                  <span>{entity.email}</span>
                                </div>
                              )}
                              {entity.phone && (
                                <div className='flex items-center space-x-1'>
                                  <Phone className='w-3 h-3' />
                                  <span>{entity.phone}</span>
                                </div>
                              )}
                              {entity.value && (
                                <div className='flex items-center space-x-1'>
                                  <DollarSign className='w-3 h-3' />
                                  <span>{formatCurrency(entity.value)}</span>
                                </div>
                              )}
                              {entity.lastContact && (
                                <div className='flex items-center space-x-1'>
                                  <Clock className='w-3 h-3' />
                                  <span>
                                    Last: {formatDate(entity.lastContact)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {entity.tags && entity.tags.length > 0 && (
                              <div className='flex items-center space-x-2 mt-2'>
                                {entity.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className='text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded'
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className='flex items-center space-x-2'>
                          <button className='p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'>
                            <ExternalLink className='w-4 h-4' />
                          </button>
                          <button
                            onClick={() => unlinkEntity(entity.id)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                          >
                            <X className='w-4 h-4' />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* AI Suggestions Tab */}
          {selectedTab === 'suggestions' && (
            <div className='space-y-4'>
              {suggestions.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Info className='w-12 h-12 mx-auto mb-4 opacity-50' />
                  <p>No AI suggestions available</p>
                  <p className='text-sm'>
                    AI will analyze email content and suggest relevant entities
                  </p>
                </div>
              ) : (
                suggestions.map(suggestion => {
                  const EntityIcon = getEntityIcon(suggestion.entity.type);
                  return (
                    <div
                      key={suggestion.entity.id}
                      className='border border-gray-200 rounded-lg p-4'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start space-x-3'>
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEntityColor(suggestion.entity.type)}`}
                          >
                            <EntityIcon className='w-5 h-5' />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-center space-x-2 mb-1'>
                              <h3 className='font-semibold text-gray-900'>
                                {suggestion.entity.name}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded ${getEntityColor(suggestion.entity.type)}`}
                              >
                                {suggestion.entity.type}
                              </span>
                              <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
                                {Math.round(suggestion.confidence * 100)}% match
                              </span>
                            </div>

                            <p className='text-sm text-gray-600 mb-2'>
                              {suggestion.reason}
                            </p>

                            <div className='flex items-center space-x-2 mb-3'>
                              {suggestion.suggestedActions.map(
                                (action, index) => (
                                  <button
                                    key={index}
                                    className='text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors'
                                  >
                                    {action}
                                  </button>
                                )
                              )}
                            </div>

                            <div className='flex items-center space-x-4 text-xs text-gray-500'>
                              {suggestion.entity.email && (
                                <div className='flex items-center space-x-1'>
                                  <Mail className='w-3 h-3' />
                                  <span>{suggestion.entity.email}</span>
                                </div>
                              )}
                              {suggestion.entity.value && (
                                <div className='flex items-center space-x-1'>
                                  <DollarSign className='w-3 h-3' />
                                  <span>
                                    {formatCurrency(suggestion.entity.value)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => linkEntity(suggestion.entity)}
                          className='px-4 py-2 bg-archer-neon text-black font-medium rounded-lg hover:bg-archer-black hover:text-white transition-colors'
                        >
                          Link Entity
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Search Tab */}
          {selectedTab === 'search' && (
            <div className='space-y-4'>
              <div className='flex space-x-2'>
                <input
                  type='text'
                  placeholder='Search for customers, projects, opportunities...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                />
                <button
                  onClick={searchEntities}
                  disabled={isLoading}
                  className='px-4 py-2 bg-archer-neon text-black font-medium rounded-lg hover:bg-archer-black hover:text-white transition-colors disabled:opacity-50'
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className='space-y-3'>
                  <h3 className='font-medium text-gray-900'>Search Results</h3>
                  {searchResults.map(entity => {
                    const EntityIcon = getEntityIcon(entity.type);
                    return (
                      <div
                        key={entity.id}
                        className='border border-gray-200 rounded-lg p-4'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${getEntityColor(entity.type)}`}
                            >
                              <EntityIcon className='w-4 h-4' />
                            </div>
                            <div>
                              <h4 className='font-medium text-gray-900'>
                                {entity.name}
                              </h4>
                              <p className='text-sm text-gray-500'>
                                {entity.type}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => linkEntity(entity)}
                            className='px-3 py-1 bg-archer-neon text-black text-sm font-medium rounded hover:bg-archer-black hover:text-white transition-colors'
                          >
                            Link
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMIntegration;
