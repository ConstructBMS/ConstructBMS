import {
  Calendar,
  Grid3X3,
  List,
  Mail,
  Phone,
  Plus,
  Search,
  User,
  ArrowLeft,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../../components/layout/Page';
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
} from '../../../components/ui';
import { ContactsGrid } from '../ContactsGrid';
import { ContactsList } from '../ContactsList';
import { useContactsStore } from '../store';

export default function ClientsPage() {
  const {
    viewMode,
    setViewMode,
    contacts,
    companies,
    addContact,
    addCompany,
    updateContact,
    updateCompany,
    removeContact,
    removeCompany,
  } = useContactsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'person' | 'company'>(
    'all'
  );

  // Filter for clients only
  const clientContacts = contacts.filter(
    contact => contact.category === 'client'
  );
  const clientCompanies = companies.filter(
    company => company.category === 'client'
  );

  // Apply search and type filters
  const filteredClientContacts = useMemo(() => {
    let filtered = clientContacts;

    if (searchQuery) {
      filtered = filtered.filter(
        contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType === 'company') {
      return [];
    }

    return filtered;
  }, [clientContacts, searchQuery, filterType]);

  const filteredClientCompanies = useMemo(() => {
    let filtered = clientCompanies;

    if (searchQuery) {
      filtered = filtered.filter(
        company =>
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType === 'person') {
      return [];
    }

    return filtered;
  }, [clientCompanies, searchQuery, filterType]);

  const allClients = [...filteredClientContacts, ...filteredClientCompanies];

  // Calculate client statistics
  const clientStats = useMemo(() => {
    const totalClients = clientContacts.length + clientCompanies.length;
    const activeClients = totalClients; // For now, assume all are active
    const recentClients = totalClients; // For now, assume all are recent

    return {
      total: totalClients,
      active: activeClients,
      recent: recentClients,
      contacts: clientContacts.length,
      companies: clientCompanies.length,
    };
  }, [clientContacts, clientCompanies]);

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: string, type: 'contact' | 'company') => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      if (type === 'contact') {
        removeContact(id);
      } else {
        removeCompany(id);
      }
    }
  };

  const handleAddClient = () => {
    // TODO: Open add client form
    console.log('Add new client');
  };

  return (
    <Page title='Client Management'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Link 
                to='/contacts' 
                className='text-sm text-muted-foreground hover:text-foreground flex items-center gap-1'
              >
                <ArrowLeft className='h-3 w-3' />
                Back to CRM Manager
              </Link>
            </div>
            <h1 className='text-2xl font-semibold'>Client Management</h1>
            <p className='text-muted-foreground'>
              Manage your client relationships, projects, and communications
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleAddClient}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Client
            </Button>
          </div>
        </div>

        {/* Client Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{clientStats.total}</div>
              <CardDescription className='text-xs'>
                {clientStats.contacts} contacts, {clientStats.companies}{' '}
                companies
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {clientStats.active}
              </div>
              <CardDescription className='text-xs'>
                Currently engaged
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Client Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>4.8/5</div>
              <CardDescription className='text-xs'>
                Average rating
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Client List */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Client Directory</h2>
            <div className='text-sm text-muted-foreground'>
              {allClients.length} clients found
            </div>
          </div>

          {/* Search and Filters */}
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search clients...'
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

          {/* Client Content */}
          {allClients.length === 0 ? (
            <div className='text-center py-12'>
              <User className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No clients found.</p>
              <p className='text-sm text-muted-foreground mt-2'>
                {searchQuery
                  ? 'Try adjusting your search criteria.'
                  : 'Add your first client to get started.'}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddClient} className='mt-4'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add First Client
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {viewMode === 'list' ? (
                <ContactsList
                  contacts={filteredClientContacts}
                  companies={filteredClientCompanies}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <ContactsGrid
                  contacts={filteredClientContacts}
                  companies={filteredClientCompanies}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
