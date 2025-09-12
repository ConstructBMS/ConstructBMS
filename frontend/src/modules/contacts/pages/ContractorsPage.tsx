import { Building2, Grid3X3, List, Search, User, Plus, Wrench, Shield, Award, Calendar, Phone, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Page } from '../../../components/layout/Page';
import { Button, Input, Tabs, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui';
import { ContactsGrid } from '../ContactsGrid';
import { ContactsList } from '../ContactsList';
import { useContactsStore } from '../store';

export default function ContractorsPage() {
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
  const [filterType, setFilterType] = useState<'all' | 'person' | 'company'>('all');

  // Filter for contractors only
  const contractorContacts = contacts.filter(
    contact => contact.category === 'contractor'
  );
  const contractorCompanies = companies.filter(
    company => company.category === 'contractor'
  );

  // Apply search and type filters
  const filteredContractorContacts = useMemo(() => {
    let filtered = contractorContacts;
    
    if (searchQuery) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterType === 'company') {
      return [];
    }
    
    return filtered;
  }, [contractorContacts, searchQuery, filterType]);

  const filteredContractorCompanies = useMemo(() => {
    let filtered = contractorCompanies;
    
    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterType === 'person') {
      return [];
    }
    
    return filtered;
  }, [contractorCompanies, searchQuery, filterType]);

  const allContractors = [...filteredContractorContacts, ...filteredContractorCompanies];

  // Calculate contractor statistics
  const contractorStats = useMemo(() => {
    const totalContractors = contractorContacts.length + contractorCompanies.length;
    const activeContractors = totalContractors; // For now, assume all are active
    const certifiedContractors = totalContractors; // For now, assume all are certified
    
    return {
      total: totalContractors,
      active: activeContractors,
      certified: certifiedContractors,
      contacts: contractorContacts.length,
      companies: contractorCompanies.length
    };
  }, [contractorContacts, contractorCompanies]);

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: string, type: 'contact' | 'company') => {
    if (window.confirm('Are you sure you want to delete this contractor?')) {
      if (type === 'contact') {
        removeContact(id);
      } else {
        removeCompany(id);
      }
    }
  };

  const handleAddContractor = () => {
    // TODO: Open add contractor form
    console.log('Add new contractor');
  };

  return (
    <Page title='Contractor Management'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div>
            <h1 className='text-2xl font-semibold'>Contractor Management</h1>
            <p className='text-muted-foreground'>
              Track contractor services, certifications, and performance
            </p>
          </div>
          <div className='flex gap-2'>
            <Button onClick={handleAddContractor} className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Add Contractor
            </Button>
          </div>
        </div>

        {/* Contractor Statistics */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Total Contractors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{contractorStats.total}</div>
              <CardDescription className='text-xs'>
                {contractorStats.contacts} contacts, {contractorStats.companies} companies
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Active Contractors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>{contractorStats.active}</div>
              <CardDescription className='text-xs'>
                Currently available
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                Certified Contractors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>{contractorStats.certified}</div>
              <CardDescription className='text-xs'>
                Licensed & certified
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
              <div className='text-2xl font-bold text-yellow-600'>4.6/5</div>
              <CardDescription className='text-xs'>
                Performance score
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className='hover:shadow-md transition-shadow cursor-pointer'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Wrench className='h-4 w-4 text-green-500' />
                Assign Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-xs'>
                Assign projects and tasks to contractors
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='hover:shadow-md transition-shadow cursor-pointer'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Shield className='h-4 w-4 text-blue-500' />
                Check Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-xs'>
                Verify licenses and certifications
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='hover:shadow-md transition-shadow cursor-pointer'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Award className='h-4 w-4 text-purple-500' />
                Performance Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-xs'>
                Review contractor performance and ratings
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Contractor List */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Contractor Directory</h2>
            <div className='text-sm text-muted-foreground'>
              {allContractors.length} contractors found
            </div>
          </div>

          {/* Search and Filters */}
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
              {/* Search */}
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search contractors...'
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

          {/* Contractor Content */}
          {allContractors.length === 0 ? (
            <div className='text-center py-12'>
              <Wrench className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No contractors found.</p>
              <p className='text-sm text-muted-foreground mt-2'>
                {searchQuery ? 'Try adjusting your search criteria.' : 'Add your first contractor to get started.'}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddContractor} className='mt-4'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add First Contractor
                </Button>
              )}
            </div>
          ) : (
            <div className='space-y-4'>
              {viewMode === 'list' ? (
                <ContactsList
                  contacts={filteredContractorContacts}
                  companies={filteredContractorCompanies}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ) : (
                <ContactsGrid
                  contacts={filteredContractorContacts}
                  companies={filteredContractorCompanies}
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