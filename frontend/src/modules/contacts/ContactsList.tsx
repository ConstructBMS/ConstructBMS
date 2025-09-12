import { Building2, Mail, Phone, User } from 'lucide-react';
import { Badge } from '../../components/ui';
import { Company, Contact } from '../../lib/types/contacts';

interface ContactsListProps {
  contacts: Contact[];
  companies: Company[];
  onEdit: (item: Contact | Company) => void;
  onDelete: (id: string, type: 'contact' | 'company') => void;
}

export function ContactsList({
  contacts,
  companies,
  onEdit,
  onDelete,
}: ContactsListProps) {
  console.log('🔍 ContactsList Debug:', {
    contactsCount: contacts.length,
    companiesCount: companies.length,
    contacts: contacts.map(c => ({ name: c.name, category: c.category })),
    companies: companies.map(c => ({ name: c.name, category: c.category })),
  });

  const allItems = [
    ...contacts.map(contact => ({ ...contact, itemType: 'contact' as const })),
    ...companies.map(company => ({ ...company, itemType: 'company' as const })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return null;
    const company = companies.find(c => c.id === companyId);
    return company?.name;
  };

  // Early return if no items
  if (allItems.length === 0) {
    console.log('🔍 ContactsList: No items to render');
    return (
      <div className='rounded-md border p-8 text-center'>
        <p className='text-muted-foreground'>No contacts or companies found.</p>
        <p className='text-sm text-muted-foreground mt-2'>
          Try adjusting your filters or add some contacts.
        </p>
      </div>
    );
  }

  console.log('🔍 ContactsList: Rendering', allItems.length, 'items');

  return (
    <div className='rounded-md border'>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='border-b bg-muted/50'>
            <tr>
              <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
                Name
              </th>
              <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
                Type
              </th>
              <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
                Email
              </th>
              <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
                Phone
              </th>
              <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
                Company
              </th>
              <th className='h-12 px-4 text-left align-middle font-medium text-muted-foreground'>
                Tags
              </th>
              <th className='h-12 px-4 text-right align-middle font-medium text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {allItems.map(item => (
              <tr
                key={`${item.itemType}-${item.id}`}
                className='border-b transition-colors hover:bg-muted/50'
              >
                <td className='p-4 align-middle'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium'>
                      {item.itemType === 'contact' ? (
                        <User className='h-4 w-4' />
                      ) : (
                        <Building2 className='h-4 w-4' />
                      )}
                    </div>
                    <div>
                      <div className='font-medium'>{item.name}</div>
                      {item.notes && (
                        <div className='text-sm text-muted-foreground truncate max-w-xs'>
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className='p-4 align-middle'>
                  <Badge
                    variant={
                      item.itemType === 'contact' ? 'default' : 'secondary'
                    }
                  >
                    {item.itemType === 'contact' ? 'Person' : 'Company'}
                  </Badge>
                </td>
                <td className='p-4 align-middle'>
                  {item.email ? (
                    <div className='flex items-center gap-2 text-sm'>
                      <Mail className='h-3 w-3 text-muted-foreground' />
                      <a
                        href={`mailto:${item.email}`}
                        className='text-primary hover:underline'
                      >
                        {item.email}
                      </a>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </td>
                <td className='p-4 align-middle'>
                  {item.phone ? (
                    <div className='flex items-center gap-2 text-sm'>
                      <Phone className='h-3 w-3 text-muted-foreground' />
                      <a
                        href={`tel:${item.phone}`}
                        className='text-primary hover:underline'
                      >
                        {item.phone}
                      </a>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </td>
                <td className='p-4 align-middle'>
                  {item.itemType === 'contact' && item.companyId ? (
                    <span className='text-sm'>
                      {getCompanyName(item.companyId)}
                    </span>
                  ) : item.itemType === 'company' ? (
                    <span className='text-sm text-muted-foreground'>—</span>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </td>
                <td className='p-4 align-middle'>
                  <div className='flex flex-wrap gap-1'>
                    {item.tags?.slice(0, 3).map(tag => (
                      <Badge key={tag} variant='outline' className='text-xs'>
                        {tag}
                      </Badge>
                    ))}
                    {item.tags && item.tags.length > 3 && (
                      <Badge variant='outline' className='text-xs'>
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className='p-4 align-middle text-right'>
                  <div className='flex items-center justify-end gap-2'>
                    <button
                      onClick={() => onEdit(item)}
                      className='text-sm text-primary hover:underline'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(item.id, item.itemType)}
                      className='text-sm text-destructive hover:underline'
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {allItems.length === 0 && (
        <div className='p-8 text-center text-muted-foreground'>
          <User className='mx-auto h-12 w-12 mb-4 opacity-50' />
          <p>No contacts or companies found.</p>
          <p className='text-sm'>
            Add your first contact or company to get started.
          </p>
        </div>
      )}
    </div>
  );
}
