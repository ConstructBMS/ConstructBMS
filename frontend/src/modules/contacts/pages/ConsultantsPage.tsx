import {
  ArrowLeft,
  Award,
  Brain,
  Briefcase,
  CheckCircle,
  DollarSign,
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
} from '../../../components/ui';
import { useContactsStore } from '../store';

export default function ConsultantsPage() {
  const {
    contacts,
    companies,
    removeContact,
    removeCompany,
  } = useContactsStore();

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
    const availableConsultants = Math.floor(totalConsultants * 0.5); // Mock 50% available
    const busyConsultants = Math.floor(totalConsultants * 0.3); // Mock 30% busy
    const consultingConsultants = totalConsultants - availableConsultants - busyConsultants;

    return {
      total: totalConsultants,
      available: availableConsultants,
      busy: busyConsultants,
      consulting: consultingConsultants,
      avgRating: 4.8, // Mock average rating
      avgRate: 150, // Mock average rate
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
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-950 dark:to-indigo-900'>
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
              <h1 className='text-3xl font-bold text-purple-900 dark:text-purple-100'>
                Expert Network
              </h1>
              <p className='text-purple-700 dark:text-purple-300 mt-2'>
                Your trusted consultants and their specialized expertise
              </p>
            </div>
            <Button
              onClick={handleAddConsultant}
              className='bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Consultant
            </Button>
          </div>

          {/* Expert Network Stats */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-purple-100 dark:bg-purple-900 rounded-full'>
                    <GraduationCap className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-purple-900 dark:text-purple-100'>
                      {consultantStats.total}
                    </p>
                    <p className='text-sm text-purple-700 dark:text-purple-300'>
                      Total Experts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700'>
              <CardContent className='p-6'>
                <div className='flex items-center gap-4'>
                  <div className='p-3 bg-blue-100 dark:bg-blue-900 rounded-full'>
                    <Brain className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                  </div>
                  <div>
                    <p className='text-2xl font-bold text-blue-900 dark:text-blue-100'>
                      {consultantStats.available}
                    </p>
                    <p className='text-sm text-blue-700 dark:text-blue-300'>
                      Available
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
                      £{consultantStats.avgRate.toFixed(0)}/hr
                    </p>
                    <p className='text-sm text-green-700 dark:text-green-300'>
                      Avg Rate
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
                      {consultantStats.avgRating.toFixed(1)}/5
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
                    placeholder='Search consultants...'
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className='pl-10 bg-white dark:bg-gray-700'
                  />
                </div>
                <div className='flex gap-2'>
                  <Badge variant='outline' className='px-3 py-1'>
                    <Lightbulb className='h-3 w-3 mr-1' />
                    {consultantStats.total} Experts
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expert Network Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredConsultants.length === 0 ? (
              <div className='col-span-full text-center py-16'>
                <div className='p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-purple-200 dark:border-purple-700'>
                  <div className='p-4 bg-purple-100 dark:bg-purple-900 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                    <Lightbulb className='h-10 w-10 text-purple-600 dark:text-purple-400' />
                  </div>
                  <h3 className='text-xl font-semibold text-purple-900 dark:text-purple-100 mb-2'>
                    No Consultants Found
                  </h3>
                  <p className='text-purple-700 dark:text-purple-300 mb-6'>
                    {searchQuery
                      ? 'No consultants match your search criteria.'
                      : 'Build your expert network by adding specialized consultants.'}
                  </p>
                  {!searchQuery && (
                    <Button
                      onClick={handleAddConsultant}
                      className='bg-purple-600 hover:bg-purple-700 text-white'
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Add Your First Consultant
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              filteredConsultants.map(consultant => (
                <Card
                  key={consultant.id}
                  className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all duration-300 hover:scale-105'
                >
                  <CardHeader className='pb-4'>
                    <div className='flex items-center gap-4'>
                      <Avatar className='h-16 w-16 border-2 border-purple-200 dark:border-purple-700'>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${consultant.name}`}
                        />
                        <AvatarFallback className='bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 text-lg font-semibold'>
                          {consultant.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                        <div className='flex-1'>
                          <CardTitle className='text-lg text-purple-900 dark:text-purple-100'>
                            {consultant.name}
                          </CardTitle>
                          <CardDescription className='text-purple-700 dark:text-purple-300'>
                            {'companyName' in consultant ? consultant.name : 'Individual Consultant'}
                          </CardDescription>
                          <div className='flex gap-2 mt-2'>
                            <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
                              <CheckCircle className='h-3 w-3 mr-1' />
                              Available
                            </Badge>
                            <Badge
                              variant='outline'
                              className='border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300'
                            >
                              {'companyName' in consultant ? 'Company' : 'Individual'}
                            </Badge>
                          </div>
                        </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300'>
                        <Phone className='h-4 w-4' />
                        {consultant.phone || 'No phone'}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300'>
                        <Mail className='h-4 w-4' />
                        {consultant.email || 'No email'}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300'>
                        <MapPin className='h-4 w-4' />
                        {'address' in consultant ? (consultant.address || 'No address') : 'No address'}
                      </div>
                    </div>

                    {/* Expertise Areas */}
                    <div className='space-y-2'>
                      <div className='text-xs font-medium text-purple-700 dark:text-purple-300'>
                        Expertise:
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {['Project Management', 'Strategic Planning', 'Risk Assessment'].map(
                          (area: string, index: number) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300'
                            >
                              {area}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    {/* Qualifications */}
                    <div className='space-y-2'>
                      <div className='text-xs font-medium text-purple-700 dark:text-purple-300'>
                        Qualifications:
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {['MBA', 'PMP', 'PRINCE2'].map(
                          (qual: string, index: number) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            >
                              <Award className='h-2 w-2 mr-1' />
                              {qual}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4 pt-4 border-t border-purple-200 dark:border-purple-700'>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-green-600 dark:text-green-400'>
                          {Math.floor(Math.random() * 30 + 10)}
                        </div>
                        <div className='text-xs text-purple-700 dark:text-purple-300'>
                          Completed
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-purple-600 dark:text-purple-400'>
                          £{Math.floor(Math.random() * 100 + 100)}/hr
                        </div>
                        <div className='text-xs text-purple-700 dark:text-purple-300'>
                          Rate
                        </div>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className='space-y-1'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-purple-700 dark:text-purple-300'>
                          Availability
                        </span>
                        <span className='font-medium text-purple-900 dark:text-purple-100'>
                          {Math.floor(Math.random() * 40 + 60)}%
                        </span>
                      </div>
                      <div className='w-full bg-purple-100 dark:bg-purple-900 rounded-full h-2'>
                        <div
                          className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className='space-y-2 pt-2 border-t border-purple-200 dark:border-purple-700'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-purple-700 dark:text-purple-300'>
                          Next Available
                        </span>
                        <span className='font-medium text-purple-900 dark:text-purple-100'>
                          {Math.floor(Math.random() * 14 + 1)} days
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-purple-700 dark:text-purple-300'>
                          Specializations
                        </span>
                        <span className='font-medium text-purple-900 dark:text-purple-100'>
                          Construction, Infrastructure
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-2'>
                      <div className='flex items-center gap-1'>
                        <Star className='h-4 w-4 text-yellow-500 fill-current' />
                        <span className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                          {(Math.random() * 2 + 3).toFixed(1)}
                        </span>
                      </div>
                      <div className='flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300'>
                        <Target className='h-3 w-3' />
                        {Math.floor(Math.random() * 3 + 1)} active
                      </div>
                    </div>

                    <div className='flex gap-2 pt-4'>
                      <Button
                        size='sm'
                        className='flex-1 bg-purple-600 hover:bg-purple-700 text-white'
                        onClick={() => handleEdit(consultant)}
                      >
                        <Briefcase className='h-3 w-3 mr-1' />
                        Consult
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='flex-1 border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-900'
                        onClick={() => handleDelete(consultant.id, 'companyName' in consultant ? 'company' : 'contact')}
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
