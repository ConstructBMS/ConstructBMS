import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Star,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../../components/layout/Page';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '../../../components/ui';
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
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  // Filter for clients only
  const clientContacts = contacts.filter(
    contact => contact.category === 'client'
  );
  const clientCompanies = companies.filter(
    company => company.category === 'client'
  );

  // Apply search filters
  const filteredClients = useMemo(() => {
    const allClients = [...clientContacts, ...clientCompanies];

    if (searchQuery) {
      return allClients.filter(
        client =>
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return allClients;
  }, [clientContacts, clientCompanies, searchQuery]);

  // Calculate client statistics
  const clientStats = useMemo(() => {
    const totalClients = clientContacts.length + clientCompanies.length;
    const activeClients = totalClients; // For now, assume all are active
    const totalValue = totalClients * 50000; // Mock project value

    return {
      total: totalClients,
      active: activeClients,
      totalValue,
      contacts: clientContacts.length,
      companies: clientCompanies.length,
    };
  }, [clientContacts, clientCompanies]);

  // Mock client data for demonstration
  const mockClientData = [
    {
      id: '1',
      name: 'John Smith',
      company: 'Smith Construction Ltd',
      email: 'john@smithconstruction.com',
      phone: '+44 20 7123 4567',
      status: 'active',
      projectValue: 125000,
      lastContact: '2024-01-15',
      satisfaction: 4.8,
      projects: 3,
      type: 'person',
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      company: 'Johnson & Associates',
      email: 'sarah@johnsonassoc.com',
      phone: '+44 20 7654 3210',
      status: 'active',
      projectValue: 89000,
      lastContact: '2024-01-12',
      satisfaction: 4.9,
      projects: 2,
      type: 'person',
    },
    {
      id: '3',
      name: 'Metropolitan Builders',
      company: 'Metropolitan Builders',
      email: 'info@metbuilders.co.uk',
      phone: '+44 20 9876 5432',
      status: 'prospect',
      projectValue: 250000,
      lastContact: '2024-01-10',
      satisfaction: 4.6,
      projects: 1,
      type: 'company',
    },
  ];

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
              Manage client relationships, track projects, and monitor
              satisfaction
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

        {/* Client Directory */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Client Directory</h2>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search clients...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 w-64'
              />
            </div>
          </div>

          {/* Client List */}
          <div className='space-y-4'>
            {filteredClients.length === 0 ? (
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
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredClients.map(client => (
                  <Card
                    key={client.id}
                    className='hover:shadow-md transition-shadow cursor-pointer'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`}
                          />
                          <AvatarFallback>
                            {client.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <CardTitle className='text-sm font-medium'>
                            {client.name}
                          </CardTitle>
                          <CardDescription className='text-xs'>
                            {client.company}
                          </CardDescription>
                        </div>
                        <Badge variant='default'>
                          Client
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Phone className='h-3 w-3' />
                        {client.phone}
                      </div>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Mail className='h-3 w-3' />
                        {client.email}
                      </div>

                      <div className='flex gap-1 pt-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1 text-xs'
                          onClick={() => handleEdit(client)}
                        >
                          Edit
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1 text-xs'
                          onClick={() => handleDelete(client.id, client.type as 'contact' | 'company')}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Page>
  );
}
