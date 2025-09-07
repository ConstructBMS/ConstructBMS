import { Building2, Grid3X3, List, Search, User } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Contact, Company, ViewMode } from '../../lib/types/contacts';
import { ContactFormData } from './ContactForm';
import { useContactsStore } from './store';
import { ContactsList } from './ContactsList';
import { ContactsGrid } from './ContactsGrid';
import { ContactForm } from './ContactForm';
import {
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../components/ui';
import { Page } from '../../components/layout/Page';

export function ContactsPage() {
  const {
    contacts,
    companies,
    addContact,
    addCompany,
    updateContact,
    updateCompany,
    removeContact,
    removeCompany,
    searchContacts,
    searchCompanies,
  } = useContactsStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'person' | 'company'>(
    'all'
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    Contact | Company | undefined
  >();

  // Filter and search logic
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    if (filterType === 'person') {
      filtered = filtered.filter(contact => contact.type === 'person');
    } else if (filterType === 'company') {
      filtered = filtered.filter(contact => contact.type === 'company');
    }

    if (searchQuery) {
      filtered = searchContacts(searchQuery).filter(
        contact =>
          filterType === 'all' ||
          (filterType === 'person' && contact.type === 'person') ||
          (filterType === 'company' && contact.type === 'company')
      );
    }

    return filtered;
  }, [contacts, filterType, searchQuery, searchContacts]);

  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    if (filterType === 'person') {
      return []; // No companies when filtering for persons
    }

    if (searchQuery) {
      filtered = searchCompanies(searchQuery);
    }

    return filtered;
  }, [companies, filterType, searchQuery, searchCompanies]);

  const handleAddContact = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleAddCompany = () => {
    setEditingItem(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (item: Contact | Company) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, type: 'contact' | 'company') => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      if (type === 'contact') {
        removeContact(id);
      } else {
        removeCompany(id);
      }
    }
  };

  const handleFormSubmit = (data: ContactFormData) => {
    if (editingItem) {
      // Update existing item
      if ('website' in editingItem) {
        // It's a company
        updateCompany(editingItem.id, data);
      } else {
        // It's a contact
        updateContact(editingItem.id, data);
      }
    } else {
      // Create new item
      if (data.type === 'company') {
        addCompany(data);
      } else {
        addContact(data);
      }
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(undefined);
  };

  const totalItems = filteredContacts.length + filteredCompanies.length;

  return (
    <Page title='Contacts'>
      <div className='space-y-6'>
        {/* Header with actions */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold'>Contacts & Companies</h1>
            <p className='text-muted-foreground'>
              Manage your contacts and company information
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleAddContact}
              className='flex items-center gap-2'
            >
              <User className='h-4 w-4' />
              Add Contact
            </Button>
            <Button
              onClick={handleAddCompany}
              variant='outline'
              className='flex items-center gap-2'
            >
              <Building2 className='h-4 w-4' />
              Add Company
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search contacts and companies...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 w-64'
              />
            </div>

            {/* Filter */}
            <Tabs
              value={filterType}
              onValueChange={value =>
                setFilterType(value as 'all' | 'person' | 'company')
              }
            >
              <TabsList>
                <TabsTrigger value='all'>All</TabsTrigger>
                <TabsTrigger value='person'>People</TabsTrigger>
                <TabsTrigger value='company'>Companies</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* View Mode Toggle */}
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>View:</span>
            <div className='flex border rounded-md'>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('list')}
                className='rounded-r-none'
              >
                <List className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setViewMode('grid')}
                className='rounded-l-none'
              >
                <Grid3X3 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className='text-sm text-muted-foreground'>
          {totalItems} {totalItems === 1 ? 'item' : 'items'} found
          {searchQuery && ` for "${searchQuery}"`}
          {filterType !== 'all' && ` (${filterType}s only)`}
        </div>

        {/* Content */}
        {viewMode === 'list' ? (
          <ContactsList
            contacts={filteredContacts}
            companies={filteredCompanies}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <ContactsGrid
            contacts={filteredContacts}
            companies={filteredCompanies}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {/* Form Modal */}
        <ContactForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          editItem={editingItem}
          companies={companies}
        />
      </div>
    </Page>
  );
}
