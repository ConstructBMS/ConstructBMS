import { Page } from '../../../components/layout/Page';
import { useContactsStore } from '../store';
import { ContactsList } from '../ContactsList';
import { ContactsGrid } from '../ContactsGrid';

export default function ContractorsPage() {
  const { viewMode, contacts, companies } = useContactsStore();

  // Filter for contractors only
  const contractorContacts = contacts.filter(
    contact => contact.category === 'contractor'
  );
  const contractorCompanies = companies.filter(
    company => company.category === 'contractor'
  );

  const allContractors = [...contractorContacts, ...contractorCompanies];

  return (
    <Page title='Contractors'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-semibold'>Contractors</h2>
            <p className='text-muted-foreground'>
              Manage your contractor contacts and companies (
              {allContractors.length} total)
            </p>
          </div>
        </div>

        {allContractors.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No contractors found.</p>
            <p className='text-sm text-muted-foreground mt-2'>
              Add your first contractor to get started.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {viewMode === 'list' ? (
              <ContactsList contacts={allContractors} />
            ) : (
              <ContactsGrid contacts={allContractors} />
            )}
          </div>
        )}
      </div>
    </Page>
  );
}
