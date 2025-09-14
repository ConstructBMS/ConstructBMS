import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  Calendar,
  CheckCircle,
  GraduationCap,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Target,
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

export default function ConsultantsPage() {
  const { contacts, companies, removeContact, removeCompany } =
    useContactsStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter for consultants only from main contacts store
  const consultantContacts = contacts.filter(
    contact => contact.category === 'consultant'
  );
  const consultantCompanies = companies.filter(
    company => company.category === 'consultant'
  );

  // Combine and filter consultants
  const filteredConsultants = useMemo(() => {
    const allConsultants = [...consultantContacts, ...consultantCompanies];

    if (searchQuery) {
      return allConsultants.filter(
        consultant =>
          consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          consultant.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          consultant.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return allConsultants;
  }, [consultantContacts, consultantCompanies, searchQuery]);

  // Calculate consultant statistics from main store data
  const consultantStats = useMemo(() => {
    const totalConsultants = consultantContacts.length + consultantCompanies.length;
    const activeConsultants = totalConsultants; // For now, assume all are active
    const totalProjects = totalConsultants * 3; // Mock projects per consultant

    return {
      total: totalConsultants,
      active: activeConsultants,
      totalProjects,
      contacts: consultantContacts.length,
      companies: consultantCompanies.length,
    };
  }, [consultantContacts, consultantCompanies]);

  const handleEdit = (consultant: any) => {
    console.log('Edit consultant:', consultant);
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
              Manage your expert consultants and advisory services
            </p>
          </div>
          <Button
            onClick={handleAddConsultant}
            className='flex items-center gap-2'
          >
            <Plus className='h-4 w-4' />
            Add Consultant
          </Button>
        </div>

        {/* Consultant Network Overview */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-purple-100 dark:bg-purple-900 rounded-full'>
                  <Brain className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {consultantStats.total}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Total Consultants
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
                  <Target className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    {consultantStats.totalProjects}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Active Projects
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-4'>
                <div className='p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full'>
                  <Star className='h-6 w-6 text-yellow-600 dark:text-yellow-400' />
                </div>
                <div>
                  <p className='text-2xl font-bold'>
                    4.9/5
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Expert Rating
                  </p>
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
                placeholder='Search consultants...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </CardContent>
        </Card>

        {/* Consultant Network Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Consultant Network
            </CardTitle>
            <CardDescription>
              Your expert consultants and their specializations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredConsultants.length === 0 ? (
              <div className='text-center py-16'>
                <div className='p-4 bg-purple-100 dark:bg-purple-900 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                  <Brain className='h-10 w-10 text-purple-600 dark:text-purple-400' />
                </div>
                <h3 className='text-xl font-semibold mb-2'>
                  No Consultants Found
                </h3>
                <p className='text-muted-foreground mb-6'>
                  {searchQuery
                    ? 'No consultants match your search criteria.'
                    : 'Add your first consultant to get started.'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={handleAddConsultant}
                    className='flex items-center gap-2'
                  >
                    <Plus className='h-4 w-4' />
                    Add Your First Consultant
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Consultant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Expertise</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Project</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConsultants.map(consultant => (
                    <TableRow key={consultant.id}>
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-10 w-10'>
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${consultant.name}`}
                            />
                            <AvatarFallback className='text-sm font-semibold'>
                              {consultant.name
                                .split(' ')
                                .map(n => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className='font-medium'>
                              {consultant.name}
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {'companyName' in consultant
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
                            {consultant.phone || 'No phone'}
                          </div>
                          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <Mail className='h-3 w-3' />
                            {consultant.email || 'No email'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-1'>
                          <Badge variant='secondary'>
                            <Lightbulb className='h-3 w-3 mr-1' />
                            Strategy
                          </Badge>
                          <Badge variant='outline'>
                            Architecture
                          </Badge>
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
                          {Math.floor(Math.random() * 21 + 1)} days ago
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            onClick={() => handleEdit(consultant)}
                          >
                            <Briefcase className='h-3 w-3 mr-1' />
                            Manage
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() =>
                              handleDelete(
                                consultant.id,
                                'companyName' in consultant
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