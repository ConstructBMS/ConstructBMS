import { Page } from '../../../components/layout/Page';
import { useContactsStore } from '../store';
import { ContactsList } from '../ContactsList';
import { ContactsGrid } from '../ContactsGrid';

export default function ClientsPage() {
  const { viewMode, contacts, companies } = useContactsStore();

  // Filter for clients only
  const clientContacts = contacts.filter(
    contact => contact.category === 'client'
  );
  const clientCompanies = companies.filter(
    company => company.category === 'client'
  );

  const allClients = [...clientContacts, ...clientCompanies];

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
              <ContactsList contacts={allClients} />
            ) : (
              <ContactsGrid contacts={allClients} />
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
