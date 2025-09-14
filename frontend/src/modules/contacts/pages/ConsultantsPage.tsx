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

export default function ConsultantsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Independent consultant data - not connected to main contacts store
  const consultants = [
    {
      id: '1',
      name: 'Dr. Alexandra Chen',
      company: 'Chen Consulting Group',
      phone: '+44 20 7123 4567',
      email: 'alexandra@chenconsulting.co.uk',
      location: 'London, UK',
      status: 'available',
      expertise: [
        'Project Management',
        'Strategic Planning',
        'Risk Assessment',
      ],
      qualifications: ['MBA', 'PMP', 'PRINCE2'],
      projectsCompleted: 23,
      hourlyRate: 150,
      availability: 80,
      rating: 4.9,
      currentProjects: 2,
      experience: '12 years',
      specializations: ['Construction', 'Infrastructure'],
      nextAvailable: 'This week',
    },
    {
      id: '2',
      name: 'Marcus Thompson',
      company: 'Thompson Advisory',
      phone: '+44 20 7654 3210',
      email: 'marcus@thompsonadvisory.co.uk',
      location: 'Manchester, UK',
      status: 'busy',
      expertise: ['Financial Analysis', 'Cost Management', 'Budget Planning'],
      qualifications: ['CPA', 'CFA', 'ACCA'],
      projectsCompleted: 18,
      hourlyRate: 125,
      availability: 60,
      rating: 4.7,
      currentProjects: 3,
      experience: '10 years',
      specializations: ['Finance', 'Accounting'],
      nextAvailable: '2 weeks',
    },
    {
      id: '3',
      name: 'Dr. Sarah Williams',
      company: 'Williams Engineering Consultancy',
      phone: '+44 20 9876 5432',
      email: 'sarah@williamsengineering.co.uk',
      location: 'Birmingham, UK',
      status: 'available',
      expertise: ['Structural Engineering', 'Design Review', 'Compliance'],
      qualifications: ['PhD Engineering', 'CEng', 'MIStructE'],
      projectsCompleted: 31,
      hourlyRate: 200,
      availability: 90,
      rating: 4.8,
      currentProjects: 1,
      experience: '15 years',
      specializations: ['Engineering', 'Design'],
      nextAvailable: 'Next week',
    },
    {
      id: '4',
      name: 'James Rodriguez',
      company: 'Rodriguez Legal Advisory',
      phone: '+44 20 5555 1234',
      email: 'james@rodriguezlegal.co.uk',
      location: 'Leeds, UK',
      status: 'consulting',
      expertise: ['Contract Law', 'Compliance', 'Risk Management'],
      qualifications: ['LLB', 'LLM', 'Solicitor'],
      projectsCompleted: 15,
      hourlyRate: 180,
      availability: 70,
      rating: 4.6,
      currentProjects: 4,
      experience: '8 years',
      specializations: ['Legal', 'Compliance'],
      nextAvailable: '3 weeks',
    },
  ];

  const filteredConsultants = consultants.filter(
    consultant =>
      consultant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      consultant.expertise.some(e =>
        e.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const consultantStats = {
    total: consultants.length,
    available: consultants.filter(c => c.status === 'available').length,
    busy: consultants.filter(c => c.status === 'busy').length,
    consulting: consultants.filter(c => c.status === 'consulting').length,
    avgRating:
      consultants.reduce((sum, consultant) => sum + consultant.rating, 0) /
      consultants.length,
    avgRate:
      consultants.reduce((sum, consultant) => sum + consultant.hourlyRate, 0) /
      consultants.length,
  };

  const handleEdit = (consultant: any) => {
    console.log('Edit consultant:', consultant);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this consultant?')) {
      console.log('Delete consultant:', id);
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
                          {consultant.company}
                        </CardDescription>
                        <div className='flex gap-2 mt-2'>
                          <Badge
                            className={`${
                              consultant.status === 'available'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : consultant.status === 'busy'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}
                          >
                            <CheckCircle className='h-3 w-3 mr-1' />
                            {consultant.status}
                          </Badge>
                          <Badge
                            variant='outline'
                            className='border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300'
                          >
                            {consultant.experience}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300'>
                        <Phone className='h-4 w-4' />
                        {consultant.phone}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300'>
                        <Mail className='h-4 w-4' />
                        {consultant.email}
                      </div>
                      <div className='flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300'>
                        <MapPin className='h-4 w-4' />
                        {consultant.location}
                      </div>
                    </div>

                    {/* Expertise Areas */}
                    <div className='space-y-2'>
                      <div className='text-xs font-medium text-purple-700 dark:text-purple-300'>
                        Expertise:
                      </div>
                      <div className='flex flex-wrap gap-1'>
                        {consultant.expertise.map(
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
                        {consultant.qualifications.map(
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
                          {consultant.projectsCompleted}
                        </div>
                        <div className='text-xs text-purple-700 dark:text-purple-300'>
                          Completed
                        </div>
                      </div>
                      <div className='text-center'>
                        <div className='text-lg font-bold text-purple-600 dark:text-purple-400'>
                          £{consultant.hourlyRate}/hr
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
                          {consultant.availability}%
                        </span>
                      </div>
                      <div className='w-full bg-purple-100 dark:bg-purple-900 rounded-full h-2'>
                        <div
                          className='bg-purple-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${consultant.availability}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className='space-y-2 pt-2 border-t border-purple-200 dark:border-purple-700'>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-purple-700 dark:text-purple-300'>
                          Next Available
                        </span>
                        <span className='font-medium text-purple-900 dark:text-purple-100'>
                          {consultant.nextAvailable}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-xs'>
                        <span className='text-purple-700 dark:text-purple-300'>
                          Specializations
                        </span>
                        <span className='font-medium text-purple-900 dark:text-purple-100'>
                          {consultant.specializations.join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className='flex items-center justify-between pt-2'>
                      <div className='flex items-center gap-1'>
                        <Star className='h-4 w-4 text-yellow-500 fill-current' />
                        <span className='text-sm font-medium text-purple-900 dark:text-purple-100'>
                          {consultant.rating}
                        </span>
                      </div>
                      <div className='flex items-center gap-1 text-xs text-purple-700 dark:text-purple-300'>
                        <Target className='h-3 w-3' />
                        {consultant.currentProjects} active
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
                        onClick={() => handleDelete(consultant.id)}
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
