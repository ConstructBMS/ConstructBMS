import {
  ArrowLeft,
  Award,
  HardHat,
  Mail,
  Phone,
  Plus,
  Search,
  Shield,
  Star,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  CheckCircle,
  Clock,
  MapPin,
  Zap,
  Tool,
  Building,
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
  const [selectedContractor, setSelectedContractor] = useState<string | null>(
    null
  );

  // Filter for contractors only
  const contractorContacts = contacts.filter(
    contact => contact.category === 'contractor'
  );
  const contractorCompanies = companies.filter(
    company => company.category === 'contractor'
  );

  // Apply search filters
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

  // Calculate contractor statistics
  const contractorStats = useMemo(() => {
    const totalContractors =
      contractorContacts.length + contractorCompanies.length;
    const activeContractors = totalContractors; // For now, assume all are active
    const certifiedContractors = Math.floor(totalContractors * 0.8); // 80% certified
    const totalCapacity = totalContractors * 100; // Mock capacity

    return {
      total: totalContractors,
      active: activeContractors,
      certified: certifiedContractors,
      totalCapacity,
      contacts: contractorContacts.length,
      companies: contractorCompanies.length,
    };
  }, [contractorContacts, contractorCompanies]);

  // Mock contractor data for demonstration
  const mockContractorData = [
    {
      id: '1',
      name: 'Mike Thompson',
      company: 'Thompson Construction',
      email: 'mike@thompsonconstruction.com',
      phone: '+44 20 1234 5678',
      status: 'available',
      specialties: ['Plumbing', 'Electrical'],
      certifications: ['CSCS', 'First Aid'],
      rating: 4.7,
      projectsCompleted: 45,
      currentProjects: 2,
      capacity: 85,
      hourlyRate: 45,
      type: 'person',
    },
    {
      id: '2',
      name: 'Sarah Williams',
      company: 'Williams & Sons',
      email: 'sarah@williamsandsons.co.uk',
      phone: '+44 20 2345 6789',
      status: 'busy',
      specialties: ['Carpentry', 'Joinery'],
      certifications: ['CSCS', 'CITB'],
      rating: 4.9,
      projectsCompleted: 78,
      currentProjects: 3,
      capacity: 95,
      hourlyRate: 55,
      type: 'person',
    },
    {
      id: '3',
      name: 'Premier Builders Ltd',
      company: 'Premier Builders Ltd',
      email: 'info@premierbuilders.co.uk',
      phone: '+44 20 3456 7890',
      status: 'available',
      specialties: ['General Construction', 'Renovation'],
      certifications: ['CSCS', 'SMSTS', 'First Aid'],
      rating: 4.6,
      projectsCompleted: 120,
      currentProjects: 1,
      capacity: 70,
      hourlyRate: 65,
      type: 'company',
    },
  ];

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
      <div className='min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950 dark:to-red-900'>
        <div className='space-y-8 p-6'>
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
              <h1 className='text-3xl font-bold text-orange-900 dark:text-orange-100'>Contractor Workforce</h1>
              <p className='text-orange-700 dark:text-orange-300 mt-2'>
                Your skilled contractors and their specialized services
              </p>
            </div>
            <Button
              onClick={handleAddContractor}
              className='bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Contractor
            </Button>
          </div>

          {/* Workforce Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200 dark:border-orange-700'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-orange-100 dark:bg-orange-900 rounded-full'>
                    <HardHat className='h-6 w-6 text-orange-600 dark:text-orange-400' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-orange-900 dark:text-orange-100'>{contractorStats.total}</p>
                    <p className='text-sm text-orange-700 dark:text-orange-300'>Total Workforce</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-200 dark:border-green-700'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-green-100 dark:bg-green-900 rounded-full'>
                    <Shield className='h-6 w-6 text-green-600 dark:text-green-400' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-green-900 dark:text-green-100'>{contractorStats.certified}</p>
                    <p className='text-sm text-green-700 dark:text-green-300'>Certified</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
                    <Zap className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>{contractorStats.totalCapacity}%</p>
                    <p className='text-sm text-blue-700 dark:text-blue-300'>Capacity</p>
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
                    <p className='text-2xl font-bold text-yellow-900 dark:text-yellow-100'>4.7/5</p>
                    <p className='text-sm text-yellow-700 dark:text-yellow-300'>Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
            <CardContent className='p-6'>
              <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    placeholder='Search contractors...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='pl-10 bg-white dark:bg-gray-700'
                  />
                </div>
                <div className='flex gap-2'>
                  <Badge variant='outline' className='px-3 py-1'>
                    <Tool className='h-3 w-3 mr-1' />
                    {contractorStats.total} Contractors
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contractor Workforce Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredContractors.length === 0 ? (
              <div className='col-span-full text-center py-16'>
                <div className='p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-orange-200 dark:border-orange-700'>
                  <div className='p-4 bg-orange-100 dark:bg-orange-900 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                    <Wrench className='h-10 w-10 text-orange-600 dark:text-orange-400' />
                  </div>
                  <h3 className='text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2'>No Contractors Yet</h3>
                  <p className='text-orange-700 dark:text-orange-300 mb-6'>
                    {searchQuery ? 'No contractors match your search criteria.' : 'Build your contractor workforce by adding skilled professionals.'}
                  </p>
                  {!searchQuery && (
                    <Button 
                      onClick={handleAddContractor}
                      className='bg-orange-600 hover:bg-orange-700 text-white'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Your First Contractor
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              filteredContractors.map(contractor => (
                <Card key={contractor.id} className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200 dark:border-orange-700 hover:shadow-xl transition-all duration-300 hover:scale-105'>
                  <CardHeader className='pb-4'>
                    <div className='flex items-center gap-4'>
                      <Avatar className='h-16 w-16 border-2 border-orange-200 dark:border-orange-700'>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${contractor.name}`}
                        />
                        <AvatarFallback className='bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 text-lg font-semibold'>
                          {contractor.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className='flex-1'>
                        <CardTitle className='text-lg text-orange-900 dark:text-orange-100'>{contractor.name}</CardTitle>
                        <CardDescription className='text-orange-700 dark:text-orange-300'>{contractor.company}</CardDescription>
                        <Badge className='mt-2 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'>
                          <HardHat className='h-3 w-3 mr-1' />
                          Skilled Professional
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300'>
                        <Phone className='h-4 w-4' />
                        {contractor.phone}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300'>
                        <Mail className='h-4 w-4' />
                        {contractor.email}
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className='space-y-2'>
                      <div className='text-xs font-medium text-orange-700 dark:text-orange-300'>Specialties:</div>
                      <div className='flex flex-wrap gap-1'>
                        {contractor.specialties.map((specialty, index) => (
                          <Badge key={index} variant='outline' className='text-xs border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300'>
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className='space-y-2'>
                      <div className='text-xs font-medium text-orange-700 dark:text-orange-300'>Certifications:</div>
                      <div className='flex flex-wrap gap-1'>
                        {contractor.certifications.map((cert, index) => (
                          <Badge key={index} variant='secondary' className='text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                            <Shield className='h-2 w-2 mr-1' />
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-4 border-t border-orange-200 dark:border-orange-700'>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-green-600 dark:text-green-400'>
                          {contractor.projectsCompleted}
                        </div>
                        <div className='text-xs text-orange-700 dark:text-orange-300'>Completed</div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-orange-600 dark:text-orange-400'>
                          £{contractor.hourlyRate}/hr
                        </div>
                        <div className='text-xs text-orange-700 dark:text-orange-300'>Rate</div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-orange-700 dark:text-orange-300'>Capacity</span>
                        <span className='font-medium text-orange-900 dark:text-orange-100'>{contractor.capacity}%</span>
                      </div>
                      <Progress value={contractor.capacity} className='h-2 bg-orange-100 dark:bg-orange-900' />
                    </div>

                    <div className='flex items-center justify-between pt-2'>
                      <div className='flex items-center gap-1'>
                        <Star className='h-4 w-4 text-yellow-500 fill-current' />
                        <span className='text-sm font-medium text-orange-900 dark:text-orange-100'>{contractor.rating}</span>
                      </div>
                      <div className='flex items-center gap-1 text-xs text-orange-700 dark:text-orange-300'>
                        <Clock className='h-3 w-3' />
                        {contractor.currentProjects} active
                      </div>
                    </div>

                    <div className='flex gap-2 pt-4'>
                      <Button
                        size='sm'
                        className='flex-1 bg-orange-600 hover:bg-orange-700 text-white'
                        onClick={() => handleEdit(contractor)}
                      >
                        <Wrench className='h-3 w-3 mr-1' />
                        Manage
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='flex-1 border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-900'
                        onClick={() => handleDelete(contractor.id, contractor.type as 'contact' | 'company')}
                      >
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
