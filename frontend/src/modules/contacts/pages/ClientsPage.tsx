import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Plus,
  Search,
  Star,
  TrendingUp,
  User,
  Users,
  Heart,
  Target,
  Award,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui';
import { useContactsStore } from '../store';

export default function ClientsPage() {
  const {
    contacts,
    companies,
    removeContact,
    removeCompany,
  } = useContactsStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter for clients only from main contacts store
  const clientContacts = contacts.filter(
    contact => contact.category === 'client'
  );
  const clientCompanies = companies.filter(
    company => company.category === 'client'
  );

  // Combine and filter clients
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

  // Calculate client statistics from main store data
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

  const handleEdit = (client: any) => {
    console.log('Edit client:', client);
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
    console.log('Add new client');
  };

  return (
    <Page title='Client Management'>
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900'>
        <div className='space-y-6 p-6'>
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
              <h1 className='text-3xl font-bold text-blue-900 dark:text-blue-100'>
                Client Portfolio
              </h1>
              <p className='text-blue-700 dark:text-blue-300 mt-2'>
                Manage your client relationships and project portfolio
              </p>
            </div>
            <Button
              onClick={handleAddClient}
              className='bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add New Client
            </Button>
          </div>

          {/* Client Portfolio Overview */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
                    <Users className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                      {clientStats.total}
                    </p>
                    <p className='text-sm text-blue-700 dark:text-blue-300'>
                      Total Clients
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-200 dark:border-green-700'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-green-100 dark:bg-green-900 rounded-full'>
                    <DollarSign className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-green-900 dark:text-green-100'>
                      £{clientStats.totalValue.toLocaleString()}
                    </p>
                    <p className='text-sm text-green-700 dark:text-green-300'>
                      Total Value
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-yellow-200 dark:border-yellow-700'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full'>
                    <Star className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-yellow-900 dark:text-yellow-100'>
                      4.7/5
                    </p>
                    <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                      Satisfaction
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
            <CardContent className='p-6'>
              <div className='relative max-w-md'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search clients...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className='pl-10 bg-white dark:bg-gray-700'
                />
              </div>
            </CardContent>
          </Card>

          {/* Client Portfolio Table */}
          <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
            <CardHeader>
              <CardTitle className='text-blue-900 dark:text-blue-100'>Client Portfolio</CardTitle>
              <CardDescription className='text-blue-700 dark:text-blue-300'>
                Your valued clients and their project relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredClients.length === 0 ? (
                <div className='text-center py-16'>
                  <div className='p-4 bg-blue-100 dark:bg-blue-900 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                    <User className='h-10 w-10 text-blue-600 dark:text-blue-400' />
                  </div>
                  <h3 className='text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2'>
                    No Clients Found
                  </h3>
                  <p className='text-blue-700 dark:text-blue-300 mb-6'>
                    {searchQuery
                      ? 'No clients match your search criteria.'
                      : 'Add your first client to get started.'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={handleAddClient}
                      className='bg-blue-600 hover:bg-blue-700 text-white'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Your First Client
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-blue-900 dark:text-blue-100'>Client</TableHead>
                      <TableHead className='text-blue-900 dark:text-blue-100'>Contact</TableHead>
                      <TableHead className='text-blue-900 dark:text-blue-100'>Project Value</TableHead>
                      <TableHead className='text-blue-900 dark:text-blue-100'>Status</TableHead>
                      <TableHead className='text-blue-900 dark:text-blue-100'>Last Contact</TableHead>
                      <TableHead className='text-blue-900 dark:text-blue-100'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map(client => (
                      <TableRow key={client.id} className='hover:bg-blue-50 dark:hover:bg-blue-900/20'>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-10 w-10 border-2 border-blue-200 dark:border-blue-700'>
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`}
                              />
                              <AvatarFallback className='bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-sm font-semibold'>
                                {client.name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className='font-medium text-blue-900 dark:text-blue-100'>{client.name}</div>
                              <div className='text-sm text-blue-700 dark:text-blue-300'>
                                {'companyName' in client ? 'Company' : 'Individual'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='space-y-1'>
                            <div className='flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300'>
                              <Phone className='h-3 w-3' />
                              {client.phone || 'No phone'}
                            </div>
                            <div className='flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300'>
                              <Mail className='h-3 w-3' />
                              {client.email || 'No email'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='text-lg font-bold text-green-600 dark:text-green-400'>
                            £{Math.floor(Math.random() * 500000 + 50000).toLocaleString()}
                          </div>
                          <div className='text-xs text-blue-700 dark:text-blue-300'>
                            {Math.floor(Math.random() * 5 + 1)} projects
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                            <CheckCircle className='h-3 w-3 mr-1' />
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='text-sm text-blue-700 dark:text-blue-300'>
                            {Math.floor(Math.random() * 7 + 1)} days ago
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              className='bg-blue-600 hover:bg-blue-700 text-white'
                              onClick={() => handleEdit(client)}
                            >
                              <Briefcase className='h-3 w-3 mr-1' />
                              Manage
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              className='border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900'
                              onClick={() => handleDelete(client.id, 'companyName' in client ? 'company' : 'contact')}
                            >
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
}