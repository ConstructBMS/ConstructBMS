import { Building2, Grid3X3, List, Search, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Page } from '../../components/layout/Page';
import {
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../components/ui';
import {
  Company,
  Contact,
  ContactCategory,
  ViewMode,
} from '../../lib/types/contacts';
import { ContactForm, ContactFormData } from './ContactForm';
import { ContactsGrid } from './ContactsGrid';
import { ContactsList } from './ContactsList';
import { useContactsStore } from './store';

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

  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'person' | 'company'>(
    'all'
  );
  const [filterCategory, setFilterCategory] = useState<ContactCategory | 'all'>(
    'all'
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    Contact | Company | undefined
  >();

  // Set filter category from URL parameters
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (
      typeParam &&
      ['client', 'contractor', 'consultant'].includes(typeParam)
    ) {
      setFilterCategory(typeParam as ContactCategory);
    } else {
      setFilterCategory('all');
    }
  }, [searchParams]);

  // Filter and search logic
  const filteredContacts = useMemo(() => {
    console.log('🔍 Debug - Total contacts:', contacts.length);
    console.log('🔍 Debug - Filter category:', filterCategory);
    console.log('🔍 Debug - Filter type:', filterType);

    let filtered = contacts;

    // Filter by type (person/company)
    if (filterType === 'person') {
      filtered = filtered.filter(contact => contact.type === 'person');
    } else if (filterType === 'company') {
      filtered = filtered.filter(contact => contact.type === 'company');
    }

    // Filter by category (client/contractor/consultant)
    if (filterCategory !== 'all') {
      console.log('🔍 Debug - Filtering by category:', filterCategory);
      filtered = filtered.filter(
        contact => contact.category === filterCategory
      );
      console.log('🔍 Debug - After category filter:', filtered.length);
    }

    if (searchQuery) {
      filtered = searchContacts(searchQuery).filter(contact => {
        const typeMatch =
          filterType === 'all' ||
          (filterType === 'person' && contact.type === 'person') ||
          (filterType === 'company' && contact.type === 'company');

        const categoryMatch =
          filterCategory === 'all' || contact.category === filterCategory;

        return typeMatch && categoryMatch;
      });
    }

    console.log('🔍 Debug - Final filtered contacts:', filtered.length);
    return filtered;
  }, [contacts, filterType, filterCategory, searchQuery, searchContacts]);

  const filteredCompanies = useMemo(() => {
    console.log('🔍 Debug - Total companies:', companies.length);
    let filtered = companies;

    if (filterType === 'person') {
      return []; // No companies when filtering for persons
    }

    // Filter by category (client/contractor/consultant)
    if (filterCategory !== 'all') {
      console.log(
        '🔍 Debug - Filtering companies by category:',
        filterCategory
      );
      filtered = filtered.filter(
        company => company.category === filterCategory
      );
      console.log('🔍 Debug - After company category filter:', filtered.length);
    }

    if (searchQuery) {
      filtered = searchCompanies(searchQuery).filter(company => {
        const categoryMatch =
          filterCategory === 'all' || company.category === filterCategory;
        return categoryMatch;
      });
    }

    console.log('🔍 Debug - Final filtered companies:', filtered.length);
    return filtered;
  }, [companies, filterType, filterCategory, searchQuery, searchCompanies]);

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
