import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Filter,
  RefreshCw,
  Users,
  Briefcase,
  Calendar,
  Globe,
  Mail as MailIcon,
} from 'lucide-react';
import { Client } from '../../services/demoData';
import { Customer, Company } from '../../types';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  type: 'app-contact' | 'email-contact';
  source: 'crm' | 'email' | 'manual';
  lastContact?: string;
  tags?: string[];
}

interface AddressBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContact: (contact: Contact) => void;
  onInsertToField: (email: string, field: 'to' | 'cc' | 'bcc') => void;
}

const AddressBookModal: React.FC<AddressBookModalProps> = ({
  isOpen,
  onClose,
  onSelectContact,
  onInsertToField,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'app-contacts' | 'email-contacts'
  >('all');
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'lastContact'>(
    'name'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
  });

  // Load contacts from different sources
  useEffect(() => {
    const loadContacts = () => {
      const allContacts: Contact[] = [];

      // Load CRM contacts (from demo data)
      try {
        const storedClients = localStorage.getItem('archerbms-demo-data');
        if (storedClients) {
          const clients: Client[] = JSON.parse(storedClients);
          clients.forEach(client => {
            allContacts.push({
              id: `crm-${client.id}`,
              name: client.contact || client.name,
              email: client.email,
              phone: client.phone,
              company: client.company,
              type: 'app-contact',
              source: 'crm',
              lastContact: client.lastContact,
              tags: ['CRM Contact'],
            });
          });
        }
      } catch (error) {
        console.log('No CRM contacts found');
      }

      // Load email contacts (from email history)
      const emailContacts: Contact[] = [
        {
          id: 'email-1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          company: 'Tech Solutions Ltd',
          position: 'Project Manager',
          type: 'email-contact',
          source: 'email',
          lastContact: '2 days ago',
          tags: ['Frequent Contact'],
        },
        {
          id: 'email-2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@construction.co.uk',
          company: 'Construction Partners',
          position: 'Director',
          type: 'email-contact',
          source: 'email',
          lastContact: '1 week ago',
          tags: ['Client'],
        },
        {
          id: 'email-3',
          name: 'Mike Chen',
          email: 'mike.chen@architects.com',
          company: 'Urban Architects',
          position: 'Senior Architect',
          type: 'email-contact',
          source: 'email',
          lastContact: '3 days ago',
          tags: ['Partner'],
        },
        {
          id: 'email-4',
          name: 'Lisa Wang',
          email: 'lisa.wang@suppliers.co.uk',
          company: 'Building Supplies Ltd',
          position: 'Sales Manager',
          type: 'email-contact',
          source: 'email',
          lastContact: '1 day ago',
          tags: ['Supplier'],
        },
        {
          id: 'email-5',
          name: 'David Rodriguez',
          email: 'david.rodriguez@contractors.com',
          company: 'Rodriguez Contractors',
          position: 'Owner',
          type: 'email-contact',
          source: 'email',
          lastContact: '5 days ago',
          tags: ['Contractor'],
        },
      ];

      allContacts.push(...emailContacts);
      setContacts(allContacts);
    };

    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  // Filter and sort contacts
  useEffect(() => {
    let filtered = contacts;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        contact =>
          contact.name.toLowerCase().includes(searchLower) ||
          contact.email.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower) ||
          contact.position?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(contact => contact.type === selectedCategory);
    }

    // Filter by favorites
    if (showFavorites) {
      filtered = filtered.filter(contact =>
        contact.tags?.includes('Frequent Contact')
      );
    }

    // Sort contacts
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'company':
          comparison = (a.company || '').localeCompare(b.company || '');
          break;
        case 'lastContact':
          comparison = (a.lastContact || '').localeCompare(b.lastContact || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredContacts(filtered);
  }, [
    contacts,
    searchTerm,
    selectedCategory,
    sortBy,
    sortOrder,
    showFavorites,
  ]);

  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      const contact: Contact = {
        id: `manual-${Date.now()}`,
        name: newContact.name,
        email: newContact.email,
        phone: newContact.phone,
        company: newContact.company,
        position: newContact.position,
        type: 'app-contact',
        source: 'manual',
        lastContact: 'Just added',
        tags: ['Manual Entry'],
      };

      setContacts(prev => [...prev, contact]);
      setNewContact({
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
      });
      setShowAddContact(false);
    }
  };

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleInsertToField = (field: 'to' | 'cc' | 'bcc') => {
    if (selectedContact) {
      onInsertToField(selectedContact.email, field);
    }
  };

  const handleSendEmail = () => {
    if (selectedContact) {
      onSelectContact(selectedContact);
      onClose();
    }
  };

  const getContactIcon = (contact: Contact) => {
    switch (contact.source) {
      case 'crm':
        return <User className='w-4 h-4 text-blue-600' />;
      case 'email':
        return <MailIcon className='w-4 h-4 text-green-600' />;
      case 'manual':
        return <Plus className='w-4 h-4 text-purple-600' />;
      default:
        return <User className='w-4 h-4 text-gray-600' />;
    }
  };

  const getContactTypeColor = (contact: Contact) => {
    switch (contact.type) {
      case 'app-contact':
        return 'bg-blue-100 text-blue-800';
      case 'email-contact':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <Users className='w-6 h-6 text-archer-neon' />
            <h2 className='text-xl font-semibold'>Address Book</h2>
            <span className='text-sm text-gray-500'>
              ({filteredContacts.length} contacts)
            </span>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='flex h-[calc(90vh-120px)]'>
          {/* Left Panel - Contact List */}
          <div className='w-2/3 border-r border-gray-200 flex flex-col'>
            {/* Search and Filters */}
            <div className='p-4 border-b border-gray-200'>
              <div className='flex items-center space-x-3 mb-4'>
                <div className='flex-1 relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Search contacts...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                  />
                </div>
                <button
                  onClick={() => setShowAddContact(true)}
                  className='px-4 py-2 bg-archer-neon text-black font-medium rounded-lg hover:bg-archer-black hover:text-white transition-colors flex items-center space-x-2'
                >
                  <Plus className='w-4 h-4' />
                  <span>Add Contact</span>
                </button>
              </div>

              {/* Filters */}
              <div className='flex items-center space-x-4'>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-archer-neon text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedCategory('app-contacts')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'app-contacts'
                        ? 'bg-archer-neon text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    App Contacts
                  </button>
                  <button
                    onClick={() => setSelectedCategory('email-contacts')}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === 'email-contacts'
                        ? 'bg-archer-neon text-black'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Email Contacts
                  </button>
                </div>

                <div className='flex items-center space-x-2'>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    className='text-sm border border-gray-300 rounded px-2 py-1'
                  >
                    <option value='name'>Sort by Name</option>
                    <option value='company'>Sort by Company</option>
                    <option value='lastContact'>Sort by Last Contact</option>
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    className='p-1 hover:bg-gray-100 rounded'
                  >
                    {sortOrder === 'asc' ? (
                      <ChevronUp className='w-4 h-4' />
                    ) : (
                      <ChevronDown className='w-4 h-4' />
                    )}
                  </button>
                </div>

                <label className='flex items-center space-x-2'>
                  <input
                    type='checkbox'
                    checked={showFavorites}
                    onChange={e => setShowFavorites(e.target.checked)}
                    className='rounded'
                  />
                  <span className='text-sm'>Favorites only</span>
                </label>
              </div>
            </div>

            {/* Contact List */}
            <div className='flex-1 overflow-y-auto'>
              {filteredContacts.map(contact => (
                <div
                  key={contact.id}
                  onClick={() => handleContactSelect(contact)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedContact?.id === contact.id
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : ''
                  }`}
                >
                  <div className='flex items-center space-x-3'>
                    <div className='flex-shrink-0'>
                      {getContactIcon(contact)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-medium text-gray-900 truncate'>
                          {contact.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getContactTypeColor(contact)}`}
                        >
                          {contact.type === 'app-contact' ? 'App' : 'Email'}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600 truncate'>
                        {contact.email}
                      </p>
                      {contact.company && (
                        <p className='text-xs text-gray-500 truncate'>
                          {contact.company}
                          {contact.position && ` • ${contact.position}`}
                        </p>
                      )}
                      {contact.lastContact && (
                        <p className='text-xs text-gray-400'>
                          Last contact: {contact.lastContact}
                        </p>
                      )}
                    </div>
                    {contact.tags?.includes('Frequent Contact') && (
                      <Star className='w-4 h-4 text-yellow-500' />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Contact Details */}
          <div className='w-1/3 flex flex-col'>
            {selectedContact ? (
              <>
                <div className='p-6 border-b border-gray-200'>
                  <div className='flex items-center space-x-3 mb-4'>
                    <div className='w-12 h-12 bg-archer-neon rounded-full flex items-center justify-center'>
                      <User className='w-6 h-6 text-black' />
                    </div>
                    <div>
                      <h3 className='text-lg font-semibold'>
                        {selectedContact.name}
                      </h3>
                      <p className='text-sm text-gray-600'>
                        {selectedContact.email}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    {selectedContact.phone && (
                      <div className='flex items-center space-x-2 text-sm'>
                        <Phone className='w-4 h-4 text-gray-400' />
                        <span>{selectedContact.phone}</span>
                      </div>
                    )}
                    {selectedContact.company && (
                      <div className='flex items-center space-x-2 text-sm'>
                        <Building className='w-4 h-4 text-gray-400' />
                        <span>{selectedContact.company}</span>
                      </div>
                    )}
                    {selectedContact.position && (
                      <div className='flex items-center space-x-2 text-sm'>
                        <Briefcase className='w-4 h-4 text-gray-400' />
                        <span>{selectedContact.position}</span>
                      </div>
                    )}
                    {selectedContact.lastContact && (
                      <div className='flex items-center space-x-2 text-sm'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        <span>Last contact: {selectedContact.lastContact}</span>
                      </div>
                    )}
                  </div>

                  {selectedContact.tags && selectedContact.tags.length > 0 && (
                    <div className='mt-4'>
                      <h4 className='text-sm font-medium text-gray-700 mb-2'>
                        Tags
                      </h4>
                      <div className='flex flex-wrap gap-1'>
                        {selectedContact.tags.map((tag, index) => (
                          <span
                            key={index}
                            className='text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className='flex-1 p-6'>
                  <h4 className='font-medium text-gray-900 mb-4'>
                    Quick Actions
                  </h4>
                  <div className='space-y-3'>
                    <button
                      onClick={() => handleSendEmail()}
                      className='w-full px-4 py-2 bg-archer-neon text-black font-medium rounded-lg hover:bg-archer-black hover:text-white transition-colors flex items-center justify-center space-x-2'
                    >
                      <Mail className='w-4 h-4' />
                      <span>Send Email</span>
                    </button>

                    <div className='space-y-2'>
                      <p className='text-sm font-medium text-gray-700'>
                        Insert to field:
                      </p>
                      <div className='grid grid-cols-3 gap-2'>
                        <button
                          onClick={() => handleInsertToField('to')}
                          className='px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors'
                        >
                          To:
                        </button>
                        <button
                          onClick={() => handleInsertToField('cc')}
                          className='px-3 py-2 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors'
                        >
                          CC:
                        </button>
                        <button
                          onClick={() => handleInsertToField('bcc')}
                          className='px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors'
                        >
                          BCC:
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-gray-400'>
                <div className='text-center'>
                  <User className='w-16 h-16 mx-auto mb-4 opacity-50' />
                  <p className='text-lg font-medium'>Select a contact</p>
                  <p className='text-sm'>
                    Choose a contact from the list to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add Contact Modal */}
        {showAddContact && (
          <div className='fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white rounded-xl shadow-2xl w-full max-w-md'>
              <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                <h3 className='text-lg font-semibold'>Add New Contact</h3>
                <button
                  onClick={() => setShowAddContact(false)}
                  className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              <div className='p-6 space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Name *
                  </label>
                  <input
                    type='text'
                    value={newContact.name}
                    onChange={e =>
                      setNewContact({ ...newContact, name: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                    placeholder='Full name'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email *
                  </label>
                  <input
                    type='email'
                    value={newContact.email}
                    onChange={e =>
                      setNewContact({ ...newContact, email: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                    placeholder='email@example.com'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Phone
                  </label>
                  <input
                    type='tel'
                    value={newContact.phone}
                    onChange={e =>
                      setNewContact({ ...newContact, phone: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                    placeholder='Phone number'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Company
                  </label>
                  <input
                    type='text'
                    value={newContact.company}
                    onChange={e =>
                      setNewContact({ ...newContact, company: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                    placeholder='Company name'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Position
                  </label>
                  <input
                    type='text'
                    value={newContact.position}
                    onChange={e =>
                      setNewContact({ ...newContact, position: e.target.value })
                    }
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-archer-neon focus:border-transparent'
                    placeholder='Job title'
                  />
                </div>
              </div>

              <div className='flex items-center justify-end p-6 border-t border-gray-200 space-x-3'>
                <button
                  onClick={() => setShowAddContact(false)}
                  className='px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddContact}
                  disabled={!newContact.name || !newContact.email}
                  className='px-4 py-2 text-sm bg-archer-neon text-black font-medium rounded-lg hover:bg-archer-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressBookModal;
