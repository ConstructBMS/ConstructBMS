import {
  Award,
  BookOpen,
  Grid3X3,
  Lightbulb,
  List,
  Plus,
  Search,
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

export default function ConsultantsPage() {
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

  // Filter for consultants only
  const consultantContacts = contacts.filter(
    contact => contact.category === 'consultant'
  );
  const consultantCompanies = companies.filter(
    company => company.category === 'consultant'
  );

  // Apply search and type filters
  const filteredConsultantContacts = useMemo(() => {
    let filtered = consultantContacts;

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
  }, [consultantContacts, searchQuery, filterType]);

  const filteredConsultantCompanies = useMemo(() => {
    let filtered = consultantCompanies;

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
  }, [consultantCompanies, searchQuery, filterType]);

  const allConsultants = [
    ...filteredConsultantContacts,
    ...filteredConsultantCompanies,
  ];

  // Calculate consultant statistics
  const consultantStats = useMemo(() => {
    const totalConsultants =
      consultantContacts.length + consultantCompanies.length;
    const activeConsultants = totalConsultants; // For now, assume all are active
    const expertConsultants = totalConsultants; // For now, assume all are experts

    return {
      total: totalConsultants,
      active: activeConsultants,
      expert: expertConsultants,
      contacts: consultantContacts.length,
      companies: consultantCompanies.length,
    };
  }, [consultantContacts, consultantCompanies]);

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: string, type: 'contact' | 'company') => {
    if (window.confirm('Are you sure you want to delete this consultant?')) {
      if (type === 'contact') {
        removeContact(id);
      } else {
        removeCompany(id);
      }
    }
  };

  const handleAddConsultant = () => {
    // TODO: Open add consultant form
    console.log('Add new consultant');
  };

  return (
    <Page title='Consultant Management'>
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
            <h1 className='text-2xl font-semibold'>Consultant Management</h1>
            <p className='text-muted-foreground'>
              Manage consultant expertise, availability, and assignments
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleAddConsultant}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Consultant
            </Button>
          </div>
        </div>

        {/* Consultant Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Consultants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{consultantStats.total}</div>
              <CardDescription className='text-xs'>
                {consultantStats.contacts} contacts, {consultantStats.companies}{' '}
                companies
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Active Consultants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {consultantStats.active}
              </div>
              <CardDescription className='text-xs'>
                Currently available
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>4.9/5</div>
              <CardDescription className='text-xs'>
                Expertise score
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Consultant List */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Consultant Directory</h2>
            <div className='text-sm text-muted-foreground'>
              {allConsultants.length} consultants found
            </div>
          </div>

          {/* Search and Filters */}
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search consultants...'
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

          {/* Consultant Content */}
          {allConsultants.length === 0 ? (
            <div className='text-center py-12'>
              <Lightbulb className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No consultants found.</p>
              <p className='text-sm text-muted-foreground mt-2'>
                {searchQuery
                  ? 'Try adjusting your search criteria.'
                  : 'Add your first consultant to get started.'}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddConsultant} className='mt-4'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add First Consultant
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {viewMode === 'list' ? (
                <ContactsList
                  contacts={filteredConsultantContacts}
                  companies={filteredConsultantCompanies}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <ContactsGrid
                  contacts={filteredConsultantContacts}
                  companies={filteredConsultantCompanies}
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
