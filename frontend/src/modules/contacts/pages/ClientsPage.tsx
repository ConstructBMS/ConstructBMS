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

  // Filter for clients only
  const clientContacts = contacts.filter(
    contact => contact.category === 'client'
  );
  const clientCompanies = companies.filter(
    company => company.category === 'client'
  );

  const allClients = [...clientContacts, ...clientCompanies];

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

        {allClients.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No clients found.</p>
            <p className='text-sm text-muted-foreground mt-2'>
              Add your first client to get started.
            </p>
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
