import {
  ArrowLeft,
  Briefcase,
  CheckCircle,
  Clock,
  HardHat,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Shield,
  Star,
  Wrench,
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

export default function ContractorsPage() {
  const { contacts, companies, removeContact, removeCompany } =
    useContactsStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter for contractors only from main contacts store
  const contractorContacts = contacts.filter(
    contact => contact.category === 'contractor'
  );
  const contractorCompanies = companies.filter(
    company => company.category === 'contractor'
  );

  // Combine and filter contractors
  const filteredContractors = useMemo(() => {
    const allContractors = [...contractorContacts, ...contractorCompanies];

    if (searchQuery) {
      return allContractors.filter(
        contractor =>
          contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contractor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contractor.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return allContractors;
  }, [contractorContacts, contractorCompanies, searchQuery]);

  // Calculate contractor statistics from main store data
  const contractorStats = useMemo(() => {
    const totalContractors =
      contractorContacts.length + contractorCompanies.length;
    const activeContractors = totalContractors; // For now, assume all are active
    const totalCapacity = totalContractors * 8; // Mock capacity hours per week

    return {
      total: totalContractors,
      active: activeContractors,
      totalCapacity,
      contacts: contractorContacts.length,
      companies: contractorCompanies.length,
    };
  }, [contractorContacts, contractorCompanies]);

  const handleEdit = (contractor: any) => {
    console.log('Edit contractor:', contractor);
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
    console.log('Add new contractor');
  };

  return (
    <Page title='Contractor Management'>
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
            <h1 className='text-2xl font-semibold'>Contractor Management</h1>
            <p className='text-muted-foreground'>
              Manage your skilled contractors and workforce capacity
            </p>
          </div>
          <Button
            onClick={handleAddContractor}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Contractor
          </Button>
        </div>

        {/* Workforce Overview */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-orange-100 dark:bg-orange-900 rounded-full'>
                  <HardHat className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>{contractorStats.total}</p>
                  <p className='text-sm text-muted-foreground'>
                    Total Contractors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-green-100 dark:bg-green-900 rounded-full'>
                  <Clock className='h-6 w-6 text-green-600 dark:text-green-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {contractorStats.totalCapacity}h
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Weekly Capacity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
                  <Shield className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>98%</p>
                  <p className='text-sm text-muted-foreground'>Safety Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className='p-6'>
            <div className='relative max-w-md'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search contractors...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </CardContent>
        </Card>

        {/* Contractor Workforce Table */}
        <Card>
          <CardHeader>
            <CardTitle>Contractor Workforce</CardTitle>
            <CardDescription>
              Your skilled contractors and their specializations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredContractors.length === 0 ? (
              <div className='text-center py-16'>
                <div className='p-4 bg-orange-100 dark:bg-orange-900 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                  <HardHat className='h-10 w-10 text-orange-600 dark:text-orange-400' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>
                  No Contractors Found
                </h3>
                <p className='text-muted-foreground mb-6'>
                  {searchQuery
                    ? 'No contractors match your search criteria.'
                    : 'Add your first contractor to get started.'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleAddContractor}
                    className='flex items-center gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    Add Your First Contractor
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contractor</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Work</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContractors.map(contractor => (
                    <TableRow key={contractor.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${contractor.name}`}
                            />
                            <AvatarFallback className='text-sm font-semibold'>
                              {contractor.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-medium'>{contractor.name}</div>
                            <div className='text-sm text-muted-foreground'>
                              {'companyName' in contractor
                                ? 'Company'
                                : 'Individual'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Phone className='h-3 w-3' />
                            {contractor.phone || 'No phone'}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Mail className='h-3 w-3' />
                            {contractor.email || 'No email'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          <Badge variant='secondary'>
                            <Wrench className='h-3 w-3 mr-1' />
                            General
                          </Badge>
                          <Badge variant='outline'>Electrical</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                          <CheckCircle className='h-3 w-3 mr-1' />
                          Available
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='text-sm text-muted-foreground'>
                          {Math.floor(Math.random() * 14 + 1)} days ago
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => handleEdit(contractor)}
                          >
                            <Briefcase className='h-3 w-3 mr-1' />
                            Manage
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              handleDelete(
                                contractor.id,
                                'companyName' in contractor
                                  ? 'company'
                                  : 'contact'
                              )
                            }
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
    </Page>
  );
}
