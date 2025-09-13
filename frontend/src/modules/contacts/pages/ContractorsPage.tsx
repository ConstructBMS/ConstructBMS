import {
  ArrowLeft,
  Award,
  FileCheck,
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
              Manage contractor workforce, track certifications, and monitor
              performance
            </p>
          </div>
          <div className='flex gap-2'>
            <Button
              onClick={handleAddContractor}
              className='flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              Add Contractor
            </Button>
          </div>
        </div>

        {/* Contractor Workforce KPIs */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <Users className='h-4 w-4' />
                Total Workforce
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{contractorStats.total}</div>
              <CardDescription className='text-xs'>
                {contractorStats.contacts} individuals,{' '}
                {contractorStats.companies} companies
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <Shield className='h-4 w-4' />
                Certified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-600'>
                {contractorStats.certified}
              </div>
              <CardDescription className='text-xs'>
                Licensed & certified
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <TrendingUp className='h-4 w-4' />
                Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-600'>
                {contractorStats.totalCapacity}%
              </div>
              <CardDescription className='text-xs'>
                Total workforce capacity
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                <Star className='h-4 w-4' />
                Avg Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-yellow-600'>4.7/5</div>
              <CardDescription className='text-xs'>
                Performance score
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Contractor Operations */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Wrench className='h-4 w-4 text-blue-500' />
                Assign Work
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-xs'>
                Assign projects and tasks to contractors
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Shield className='h-4 w-4 text-green-500' />
                Check Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-xs'>
                Verify licenses and certifications
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Award className='h-4 w-4 text-purple-500' />
                Performance Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-xs'>
                Review contractor performance
              </CardDescription>
            </CardContent>
          </Card>

          <Card className='hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500'>
            <CardHeader className='pb-2'>
              <CardTitle className='text-sm font-medium flex items-center gap-2'>
                <Truck className='h-4 w-4 text-orange-500' />
                Schedule Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className='text-xs'>
                Schedule equipment and material delivery
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Contractor Workforce */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-semibold'>Contractor Workforce</h2>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search contractors...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10 w-64'
              />
            </div>
          </div>

          {/* Contractor Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {mockContractorData.map(contractor => (
              <Card
                key={contractor.id}
                className='hover:shadow-md transition-shadow cursor-pointer'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-10 w-10'>
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${contractor.name}`}
                      />
                      <AvatarFallback>
                        {contractor.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <CardTitle className='text-sm font-medium'>
                        {contractor.name}
                      </CardTitle>
                      <CardDescription className='text-xs'>
                        {contractor.company}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        contractor.status === 'available'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {contractor.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Phone className='h-3 w-3' />
                    {contractor.phone}
                  </div>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <Mail className='h-3 w-3' />
                    {contractor.email}
                  </div>

                  {/* Specialties */}
                  <div className='space-y-1'>
                    <div className='text-xs font-medium text-muted-foreground'>
                      Specialties:
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {contractor.specialties.map((specialty, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-xs'
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className='space-y-1'>
                    <div className='text-xs font-medium text-muted-foreground'>
                      Certifications:
                    </div>
                    <div className='flex flex-wrap gap-1'>
                      {contractor.certifications.map((cert, index) => (
                        <Badge
                          key={index}
                          variant='secondary'
                          className='text-xs'
                        >
                          <Shield className='h-2 w-2 mr-1' />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className='grid grid-cols-2 gap-2 pt-2 border-t'>
                    <div className='text-center'>
                      <div className='text-sm font-semibold text-green-600'>
                        {contractor.projectsCompleted}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        Completed
                      </div>
                    </div>
                    <div className='text-center'>
                      <div className='text-sm font-semibold text-blue-600'>
                        £{contractor.hourlyRate}/hr
                      </div>
                      <div className='text-xs text-muted-foreground'>Rate</div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className='space-y-1'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-muted-foreground'>Capacity</span>
                      <span className='font-medium'>
                        {contractor.capacity}%
                      </span>
                    </div>
                    <Progress value={contractor.capacity} className='h-1' />
                  </div>

                  {/* Rating and Actions */}
                  <div className='flex items-center justify-between pt-2 border-t'>
                    <div className='flex items-center gap-1'>
                      <Star className='h-3 w-3 text-yellow-500 fill-current' />
                      <span className='text-xs font-medium'>
                        {contractor.rating}
                      </span>
                    </div>
                    <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                      <HardHat className='h-3 w-3' />
                      {contractor.currentProjects} active
                    </div>
                  </div>

                  <div className='flex gap-1 pt-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 text-xs'
                    >
                      <Phone className='h-3 w-3 mr-1' />
                      Call
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 text-xs'
                    >
                      <FileCheck className='h-3 w-3 mr-1' />
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockContractorData.length === 0 && (
            <div className='text-center py-12'>
              <Wrench className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground'>No contractors found.</p>
              <p className='text-sm text-muted-foreground mt-2'>
                {searchQuery
                  ? 'Try adjusting your search criteria.'
                  : 'Add your first contractor to get started.'}
              </p>
              {!searchQuery && (
                <Button onClick={handleAddContractor} className='mt-4'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add First Contractor
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
}
