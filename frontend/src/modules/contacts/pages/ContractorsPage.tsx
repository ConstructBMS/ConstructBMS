import {
  ArrowLeft,
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
  Tool,
  Wrench,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
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

export default function ContractorsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Independent contractor data - not connected to main contacts store
  const contractors = [
    {
      id: '1',
      name: 'James Mitchell',
      company: 'Mitchell Construction',
      phone: '+44 20 7123 4567',
      email: 'james@mitchellconstruction.co.uk',
      location: 'London, UK',
      status: 'available',
      specialties: ['Plumbing', 'Electrical', 'HVAC'],
      certifications: ['CSCS', 'IPAF', 'CPCS'],
      projectsCompleted: 45,
      hourlyRate: 45,
      capacity: 85,
      rating: 4.7,
      currentProjects: 2,
      experience: '15 years',
      insurance: 'Valid',
      nextAvailable: 'Next week',
    },
    {
      id: '2',
      name: 'Lisa Rodriguez',
      company: 'Rodriguez Builders',
      phone: '+44 20 7654 3210',
      email: 'lisa@rodriguezbuilders.co.uk',
      location: 'Manchester, UK',
      status: 'busy',
      specialties: ['Carpentry', 'Flooring', 'Painting'],
      certifications: ['CSCS', 'First Aid'],
      projectsCompleted: 32,
      hourlyRate: 35,
      capacity: 95,
      rating: 4.9,
      currentProjects: 3,
      experience: '12 years',
      insurance: 'Valid',
      nextAvailable: '2 weeks',
    },
    {
      id: '3',
      name: 'Robert Thompson',
      company: 'Thompson Electrical',
      phone: '+44 20 9876 5432',
      email: 'robert@thompsonelectrical.co.uk',
      location: 'Birmingham, UK',
      status: 'available',
      specialties: ['Electrical', 'Security Systems', 'Smart Home'],
      certifications: ['CSCS', 'NICEIC', 'EAS'],
      projectsCompleted: 67,
      hourlyRate: 55,
      capacity: 70,
      rating: 4.8,
      currentProjects: 1,
      experience: '20 years',
      insurance: 'Valid',
      nextAvailable: 'This week',
    },
    {
      id: '4',
      name: 'Sarah Williams',
      company: 'Williams Plumbing',
      phone: '+44 20 5555 1234',
      email: 'sarah@williamsplumbing.co.uk',
      location: 'Leeds, UK',
      status: 'on-site',
      specialties: ['Plumbing', 'Heating', 'Bathroom Fitting'],
      certifications: ['CSCS', 'Gas Safe', 'WaterSafe'],
      projectsCompleted: 28,
      hourlyRate: 40,
      capacity: 90,
      rating: 4.6,
      currentProjects: 4,
      experience: '8 years',
      insurance: 'Valid',
      nextAvailable: '3 weeks',
    },
  ];

  const filteredContractors = contractors.filter(
    contractor =>
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.specialties.some(s =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const contractorStats = {
    total: contractors.length,
    available: contractors.filter(c => c.status === 'available').length,
    busy: contractors.filter(c => c.status === 'busy').length,
    onSite: contractors.filter(c => c.status === 'on-site').length,
    avgRating:
      contractors.reduce((sum, contractor) => sum + contractor.rating, 0) /
      contractors.length,
    totalCapacity:
      contractors.reduce((sum, contractor) => sum + contractor.capacity, 0) /
      contractors.length,
  };

  const handleEdit = (contractor: any) => {
    console.log('Edit contractor:', contractor);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this contractor?')) {
      console.log('Delete contractor:', id);
    }
  };

  const handleAddContractor = () => {
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
              <h1 className='text-3xl font-bold text-orange-900 dark:text-orange-100'>
                Contractor Workforce
              </h1>
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
                    <p className='text-2xl font-bold text-orange-900 dark:text-orange-100'>
                      {contractorStats.total}
                    </p>
                    <p className='text-sm text-orange-700 dark:text-orange-300'>
                      Total Workforce
                    </p>
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
                    <p className='text-2xl font-bold text-green-900 dark:text-green-100'>
                      {contractorStats.available}
                    </p>
                    <p className='text-sm text-green-700 dark:text-green-300'>
                      Available
                    </p>
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
                    <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                      {contractorStats.totalCapacity.toFixed(0)}%
                    </p>
                    <p className='text-sm text-blue-700 dark:text-blue-300'>
                      Avg Capacity
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
                      {contractorStats.avgRating.toFixed(1)}/5
                    </p>
                    <p className='text-sm text-yellow-700 dark:text-yellow-300'>
                      Rating
                    </p>
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
                  <h3 className='text-xl font-semibold text-orange-900 dark:text-orange-100 mb-2'>
                    No Contractors Found
                  </h3>
                  <p className='text-orange-700 dark:text-orange-300 mb-6'>
                    {searchQuery
                      ? 'No contractors match your search criteria.'
                      : 'Build your contractor workforce by adding skilled professionals.'}
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
                <Card
                  key={contractor.id}
                  className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-orange-200 dark:border-orange-700 hover:shadow-xl transition-all duration-300 hover:scale-105'
                >
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
                        <CardTitle className='text-lg text-orange-900 dark:text-orange-100'>
                          {contractor.name}
                        </CardTitle>
                        <CardDescription className='text-orange-700 dark:text-orange-300'>
                          {contractor.company}
                        </CardDescription>
                        <div className='flex gap-2 mt-2'>
                          <Badge
                            className={`${
                              contractor.status === 'available'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : contractor.status === 'busy'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}
                          >
                            <CheckCircle className='h-3 w-3 mr-1' />
                            {contractor.status}
                          </Badge>
                          <Badge
                            variant='outline'
                            className='border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300'
                          >
                            {contractor.experience}
                          </Badge>
                        </div>
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
                      <div className='flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300'>
                        <MapPin className='h-4 w-4' />
                        {contractor.location}
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className='space-y-2'>
                      <div className='text-xs font-medium text-orange-700 dark:text-orange-300'>
                        Specialties:
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {contractor.specialties.map(
                          (specialty: string, index: number) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs border-orange-200 text-orange-700 dark:border-orange-700 dark:text-orange-300'
                            >
                              {specialty}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className='space-y-2'>
                      <div className='text-xs font-medium text-orange-700 dark:text-orange-300'>
                        Certifications:
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {contractor.certifications.map(
                          (cert: string, index: number) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            >
                              <Shield className='h-2 w-2 mr-1' />
                              {cert}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-4 border-t border-orange-200 dark:border-orange-700'>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-green-600 dark:text-green-400'>
                          {contractor.projectsCompleted}
                        </div>
                        <div className='text-xs text-orange-700 dark:text-orange-300'>
                          Completed
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-orange-600 dark:text-orange-400'>
                          £{contractor.hourlyRate}/hr
                        </div>
                        <div className='text-xs text-orange-700 dark:text-orange-300'>
                          Rate
                        </div>
                      </div>
                    </div>

                    {/* Capacity */}
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-orange-700 dark:text-orange-300'>
                          Capacity
                        </span>
                        <span className='font-medium text-orange-900 dark:text-orange-100'>
                          {contractor.capacity}%
                        </span>
                      </div>
                      <div className='w-full bg-orange-100 dark:bg-orange-900 rounded-full h-2'>
                        <div
                          className='bg-orange-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${contractor.capacity}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className='space-y-2 pt-2 border-t border-orange-200 dark:border-orange-700'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-orange-700 dark:text-orange-300'>
                          Next Available
                        </span>
                        <span className='font-medium text-orange-900 dark:text-orange-100'>
                          {contractor.nextAvailable}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-orange-700 dark:text-orange-300'>
                          Insurance
                        </span>
                        <span className='font-medium text-green-600 dark:text-green-400'>
                          {contractor.insurance}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-2'>
                      <div className='flex items-center gap-1'>
                        <Star className='h-4 w-4 text-yellow-500 fill-current' />
                        <span className='text-sm font-medium text-orange-900 dark:text-orange-100'>
                          {contractor.rating}
                        </span>
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
                        onClick={() => handleDelete(contractor.id)}
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
