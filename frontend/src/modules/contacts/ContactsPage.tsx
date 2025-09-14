import {
  ArrowRight,
  Briefcase,
  Building2,
  Grid3X3,
  List,
  Search,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../../components/layout/Page';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

function ContactsPage() {
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

  // No URL parameter filtering needed - using separate routes now

  // Filter and search logic
  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    // Filter by type (person/company) - contacts are always 'person' type
    if (filterType === 'company') {
      filtered = []; // No contacts when filtering for companies
    }
    // If filterType is 'person' or 'all', keep all contacts (they're all persons)

    // Filter by category (client/contractor/consultant)
    if (filterCategory !== 'all') {
      filtered = filtered.filter(
        contact => contact.category === filterCategory
      );
    }

    if (searchQuery) {
      filtered = searchContacts(searchQuery).filter(contact => {
        const typeMatch = filterType === 'all' || filterType === 'person';
        const categoryMatch =
          filterCategory === 'all' || contact.category === filterCategory;

        return typeMatch && categoryMatch;
      });
    }

    return filtered;
  }, [contacts, filterType, filterCategory, searchQuery, searchContacts]);

  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Filter by type (person/company) - companies are always 'company' type
    if (filterType === 'person') {
      return []; // No companies when filtering for persons
    }
    // If filterType is 'company' or 'all', keep all companies (they're all companies)

    // Filter by category (client/contractor/consultant)
    if (filterCategory !== 'all') {
      filtered = filtered.filter(
        company => company.category === filterCategory
      );
    }

    if (searchQuery) {
      filtered = searchCompanies(searchQuery).filter(company => {
        const typeMatch = filterType === 'all' || filterType === 'company';
        const categoryMatch =
          filterCategory === 'all' || company.category === filterCategory;
        return typeMatch && categoryMatch;
      });
    }

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

  // Calculate statistics for CRM dashboard
  const stats = useMemo(() => {
    const clientContacts = contacts.filter(c => c.category === 'client').length;
    const clientCompanies = companies.filter(
      c => c.category === 'client'
    ).length;
    const contractorContacts = contacts.filter(
      c => c.category === 'contractor'
    ).length;
    const contractorCompanies = companies.filter(
      c => c.category === 'contractor'
    ).length;
    const consultantContacts = contacts.filter(
      c => c.category === 'consultant'
    ).length;
    const consultantCompanies = companies.filter(
      c => c.category === 'consultant'
    ).length;
    const otherContacts = contacts.filter(
      c => !['client', 'contractor', 'consultant'].includes(c.category)
    ).length;
    const otherCompanies = companies.filter(
      c => !['client', 'contractor', 'consultant'].includes(c.category)
    ).length;

    return {
      clients: clientContacts + clientCompanies,
      contractors: contractorContacts + contractorCompanies,
      consultants: consultantContacts + consultantCompanies,
      others: otherContacts + otherCompanies,
      total: contacts.length + companies.length,
    };
  }, [contacts, companies]);

  return (
    <Page title='CRM Manager'>
      <div className='space-y-6'>
        {/* Header with actions */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold'>CRM Manager</h1>
            <p className='text-muted-foreground'>
              Comprehensive contact and relationship management system
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

        {/* CRM Dashboard Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card className='hover:shadow-md transition-shadow cursor-pointer'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className='text-2xl font-bold'>{stats.clients}</div>
                 <Link
                   to='/contacts/clients'
                   className='text-primary hover:text-primary/80'
                 >
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
              <CardDescription className='text-xs'>
                Customer relationships
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='hover:shadow-md transition-shadow cursor-pointer'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Contractors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className='text-2xl font-bold'>{stats.contractors}</div>
                 <Link
                   to='/contacts/contractors'
                   className='text-primary hover:text-primary/80'
                 >
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
              <CardDescription className='text-xs'>
                Service providers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='hover:shadow-md transition-shadow cursor-pointer'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Consultants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className='text-2xl font-bold'>{stats.consultants}</div>
                 <Link
                   to='/contacts/consultants'
                   className='text-primary hover:text-primary/80'
                 >
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
              <CardDescription className='text-xs'>
                Expert advisors
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='hover:shadow-md transition-shadow cursor-pointer'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Others
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <div className='text-2xl font-bold'>{stats.others}</div>
                <div className='text-muted-foreground'>
                  <Users className='h-4 w-4' />
                </div>
              </div>
              <CardDescription className='text-xs'>
                Additional contacts
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Link to='/contacts/clients'>
            <Card className='hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <UserCheck className='h-4 w-4 text-blue-500' />
                  Client Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-xs'>
                  Manage client relationships, projects, and communications
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to='/contacts/contractors'>
            <Card className='hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <Briefcase className='h-4 w-4 text-green-500' />
                  Contractor Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-xs'>
                  Track contractor services, certifications, and performance
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link to='/contacts/consultants'>
            <Card className='hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium flex items-center gap-2'>
                  <Users className='h-4 w-4 text-purple-500' />
                  Consultant Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-xs'>
                  Manage consultant expertise, availability, and assignments
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Comprehensive CRM Manager */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>
              Comprehensive Contact Management
            </h2>
            <div className='text-sm text-muted-foreground'>
              Total: {stats.total} contacts and companies across all categories
            </div>
          </div>

          {/* Advanced Toolbar */}
          <div className='space-y-4'>
            {/* Search and Primary Filters */}
            <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
              <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                {/* Search */}
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search all contacts and companies...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='pl-10 w-64'
                  />
                </div>

                {/* Type Filter */}
                <Tabs
                  value={filterType}
                  onValueChange={value =>
                    setFilterType(value as 'all' | 'person' | 'company')
                  }
                >
                  <TabsList>
                    <TabsTrigger value='all'>All Types</TabsTrigger>
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

            {/* Category Filter */}
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
              <span className='text-sm font-medium text-muted-foreground'>
                Filter by Category:
              </span>
              <Tabs
                value={filterCategory}
                onValueChange={value =>
                  setFilterCategory(value as ContactCategory | 'all')
                }
              >
                <TabsList>
                  <TabsTrigger value='all'>All Categories</TabsTrigger>
                  <TabsTrigger value='client'>
                    Clients ({stats.clients})
                  </TabsTrigger>
                  <TabsTrigger value='contractor'>
                    Contractors ({stats.contractors})
                  </TabsTrigger>
                  <TabsTrigger value='consultant'>
                    Consultants ({stats.consultants})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Active Filter Indicator */}
          {filterCategory !== 'all' && (
            <div className='p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                  <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
                    Showing {filterCategory}s only
                  </span>
                </div>
                <Link
                  to='/contacts'
                  className='text-sm text-blue-600 dark:text-blue-400 hover:underline'
                >
                  View all contacts
                </Link>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg'>
            <div className='text-sm text-muted-foreground'>
              <strong>{totalItems}</strong>{' '}
              {totalItems === 1 ? 'item' : 'items'} found
              {searchQuery && ` for "${searchQuery}"`}
              {filterType !== 'all' && ` (${filterType}s only)`}
              {filterCategory !== 'all' && ` (${filterCategory}s only)`}
            </div>
            <div className='flex gap-2 text-xs text-muted-foreground'>
              <span>Clients: {stats.clients}</span>
              <span>•</span>
              <span>Contractors: {stats.contractors}</span>
              <span>•</span>
              <span>Consultants: {stats.consultants}</span>
              <span>•</span>
              <span>Others: {stats.others}</span>
            </div>
          </div>

          {/* Content */}
          {totalItems === 0 ? (
            <div className='text-center py-12'>
              <Users className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No contacts found.</p>
              <p className='text-sm text-muted-foreground mt-2'>
                {searchQuery || filterCategory !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Add your first contact to get started.'}
              </p>
              {!searchQuery &&
                filterCategory === 'all' &&
                filterType === 'all' && (
                  <div className='flex gap-2 justify-center mt-4'>
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
                )}
            </div>
          ) : (
            <div className='space-y-4'>
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
            </div>
          )}
        </div>

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

export default ContactsPage;
