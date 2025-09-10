import { Page } from '../../../components/layout/Page';
import { useContactsStore } from '../store';
import { ContactsList } from '../ContactsList';
import { ContactsGrid } from '../ContactsGrid';

export default function ConsultantsPage() {
  const { viewMode, contacts, companies, updateContact, updateCompany, removeContact, removeCompany } = useContactsStore();

  // Filter for consultants only
  const consultantContacts = contacts.filter(
    contact => contact.category === 'consultant'
  );
  const consultantCompanies = companies.filter(
    company => company.category === 'consultant'
  );

  const allConsultants = [...consultantContacts, ...consultantCompanies];

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
    <Page title='Consultants'>
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-semibold'>Consultants</h2>
            <p className='text-muted-foreground'>
              Manage your consultant contacts and companies (
              {allConsultants.length} total)
            </p>
          </div>
        </div>

        {allConsultants.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No consultants found.</p>
            <p className='text-sm text-muted-foreground mt-2'>
              Add your first consultant to get started.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {viewMode === 'list' ? (
              <ContactsList 
                contacts={consultantContacts} 
                companies={consultantCompanies}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <ContactsGrid 
                contacts={consultantContacts} 
                companies={consultantCompanies}
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
