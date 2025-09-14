import {
  ArrowLeft,
  Award,
  BookOpen,
  Brain,
  Calendar,
  DollarSign,
  Lightbulb,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Presentation,
  Search,
  Star,
  Target,
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
  Progress,
} from '../../../components/ui';
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
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(
    null
  );

  // Filter for consultants only
  const consultantContacts = contacts.filter(
    contact => contact.category === 'consultant'
  );
  const consultantCompanies = companies.filter(
    company => company.category === 'consultant'
  );

  // Apply search filters
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

  // Calculate consultant statistics
  const consultantStats = useMemo(() => {
    const totalConsultants =
      consultantContacts.length + consultantCompanies.length;
    const activeConsultants = totalConsultants; // For now, assume all are active
    const expertConsultants = Math.floor(totalConsultants * 0.9); // 90% experts
    const totalRevenue = totalConsultants * 75000; // Mock revenue

    return {
      total: totalConsultants,
      active: activeConsultants,
      expert: expertConsultants,
      totalRevenue,
      contacts: consultantContacts.length,
      companies: consultantCompanies.length,
    };
  }, [consultantContacts, consultantCompanies]);

  // Mock consultant data for demonstration
  const mockConsultantData = [
    {
      id: '1',
      name: 'Dr. Emma Richardson',
      company: 'Richardson Advisory',
      email: 'emma@richardsonadvisory.com',
      phone: '+44 20 1111 2222',
      status: 'available',
      expertise: ['Strategic Planning', 'Business Development'],
      qualifications: ['MBA', 'PhD Business'],
      rating: 4.9,
      projectsCompleted: 67,
      currentProjects: 1,
      hourlyRate: 150,
      availability: 80,
      type: 'person',
    },
    {
      id: '2',
      name: 'James Mitchell',
      company: 'Mitchell Consulting Group',
      email: 'james@mitchellconsulting.co.uk',
      phone: '+44 20 3333 4444',
      status: 'busy',
      expertise: ['Operations', 'Process Improvement'],
      qualifications: ['CIMA', 'Six Sigma Black Belt'],
      rating: 4.8,
      projectsCompleted: 89,
      currentProjects: 2,
      hourlyRate: 125,
      availability: 60,
      type: 'person',
    },
    {
      id: '3',
      name: 'Strategic Solutions Ltd',
      company: 'Strategic Solutions Ltd',
      email: 'info@strategicsolutions.co.uk',
      phone: '+44 20 5555 6666',
      status: 'available',
      expertise: ['Digital Transformation', 'Change Management'],
      qualifications: ['PMP', 'Agile Certified'],
      rating: 4.7,
      projectsCompleted: 156,
      currentProjects: 1,
      hourlyRate: 200,
      availability: 90,
      type: 'company',
    },
  ];

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
              Manage expert consultants, track expertise, and monitor project
              performance
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

        {/* Consultant Directory */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Consultant Directory</h2>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search consultants...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 w-64'
              />
            </div>
          </div>

          {/* Consultant List */}
          <div className='space-y-4'>
            {filteredConsultants.length === 0 ? (
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
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredConsultants.map(consultant => (
                  <Card
                    key={consultant.id}
                    className='hover:shadow-md transition-shadow cursor-pointer'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${consultant.name}`}
                          />
                          <AvatarFallback>
                            {consultant.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1'>
                          <CardTitle className='text-sm font-medium'>
                            {consultant.name}
                          </CardTitle>
                          <CardDescription className='text-xs'>
                            {consultant.company}
                          </CardDescription>
                        </div>
                        <Badge variant='default'>
                          Consultant
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Phone className='h-3 w-3' />
                        {consultant.phone}
                      </div>
                      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <Mail className='h-3 w-3' />
                        {consultant.email}
                      </div>

                      <div className='flex gap-1 pt-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1 text-xs'
                          onClick={() => handleEdit(consultant)}
                        >
                          Edit
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='flex-1 text-xs'
                          onClick={() => handleDelete(consultant.id, consultant.type as 'contact' | 'company')}
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
