import { Page } from '../../../components/layout/Page';
import { ContactsGrid } from '../ContactsGrid';
import { ContactsList } from '../ContactsList';
import { useContactsStore } from '../store';

export default function ClientsPage() {
  const {
    viewMode,
    contacts,
    companies,
    updateContact,
    updateCompany,
    removeContact,
    removeCompany,
  } = useContactsStore();

  // Debug logging
  console.log('🔍 ClientsPage Debug:', {
    totalContacts: contacts.length,
    totalCompanies: companies.length,
    contacts: contacts.map(c => ({ name: c.name, category: c.category })),
    companies: companies.map(c => ({ name: c.name, category: c.category })),
  });

  // Filter for clients only
  const clientContacts = contacts.filter(
    contact => contact.category === 'client'
  );
  const clientCompanies = companies.filter(
    company => company.category === 'client'
  );

  const allClients = [...clientContacts, ...clientCompanies];

  console.log('🔍 Filtered Clients:', {
    clientContacts: clientContacts.length,
    clientCompanies: clientCompanies.length,
    allClients: allClients.length,
  });

  const handleEdit = (item: any) => {
    console.log('Edit item:', item);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: string, type: 'contact' | 'company') => {
    console.log('Delete item:', id, type);
    if (type === 'contact') {
      removeContact(id);
    } else {
      removeCompany(id);
    }
  };

  return (
    <Page title='Clients'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-semibold'>Clients</h2>
            <p className='text-muted-foreground'>
              Manage your client contacts and companies ({allClients.length}{' '}
              total)
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className='mb-4 p-4 bg-muted rounded-lg'>
          <h3 className='font-medium mb-2'>Debug Information:</h3>
          <p>Total Contacts: {contacts.length}</p>
          <p>Total Companies: {companies.length}</p>
          <p>Client Contacts: {clientContacts.length}</p>
          <p>Client Companies: {clientCompanies.length}</p>
          <p>All Clients: {allClients.length}</p>
          <p>View Mode: {viewMode}</p>
        </div>

        {allClients.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No clients found.</p>
            <p className='text-sm text-muted-foreground mt-2'>
              Add your first client to get started.
            </p>
            <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
              <p className='text-sm text-yellow-800'>
                <strong>Debug:</strong> If you see this message, the contacts store might be empty or the filtering is not working correctly.
              </p>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            {viewMode === 'list' ? (
              <ContactsList
                contacts={clientContacts}
                companies={clientCompanies}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <ContactsGrid
                contacts={clientContacts}
                companies={clientCompanies}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
