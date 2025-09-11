import { Building2, Mail, Phone, User } from 'lucide-react';
import { Contact, Company } from '../../lib/types/contacts';
import { Badge, Card, CardContent } from '../../components/ui';

interface ContactsGridProps {
  contacts: Contact[];
  companies: Company[];
  onEdit: (item: Contact | Company) => void;
  onDelete: (id: string, type: 'contact' | 'company') => void;
}

export function ContactsGrid({
  contacts,
  companies,
  onEdit,
  onDelete,
}: ContactsGridProps) {
  console.log('🔍 ContactsGrid Debug:', {
    contactsCount: contacts.length,
    companiesCount: companies.length,
    contacts: contacts.map(c => ({ name: c.name, category: c.category })),
    companies: companies.map(c => ({ name: c.name, category: c.category })),
  });

  const allItems = [
    ...contacts.map(contact => ({ ...contact, itemType: 'contact' as const })),
    ...companies.map(company => ({ ...company, itemType: 'company' as const })),
  ].sort((a, b) => a.name.localeCompare(b.name));

  console.log('🔍 ContactsGrid allItems:', allItems.length, allItems.map(item => ({ name: item.name, itemType: item.itemType })));

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return null;
    const company = companies.find(c => c.id === companyId);
    return company?.name;
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {allItems.map(item => (
        <Card
          key={`${item.itemType}-${item.id}`}
          className='hover:shadow-md transition-shadow'
        >
          <CardContent className='p-4'>
            <div className='flex items-start justify-between mb-3'>
              <div className='flex items-center gap-3'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium'>
                  {item.itemType === 'contact' ? (
                    <User className='h-5 w-5' />
                  ) : (
                    <Building2 className='h-5 w-5' />
                  )}
                </div>
                <div>
                  <h3 className='font-medium text-sm'>{item.name}</h3>
                  <Badge
                    variant={
                      item.itemType === 'contact' ? 'default' : 'secondary'
                    }
                    className='text-xs'
                  >
                    {item.itemType === 'contact' ? 'Person' : 'Company'}
                  </Badge>
                </div>
              </div>
              <div className='flex gap-1'>
                <button
                  onClick={() => onEdit(item)}
                  className='text-xs text-primary hover:underline'
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id, item.itemType)}
                  className='text-xs text-destructive hover:underline'
                >
                  Delete
                </button>
              </div>
            </div>

            <div className='space-y-2 text-sm'>
              {item.email && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Mail className='h-3 w-3' />
                  <a
                    href={`mailto:${item.email}`}
                    className='text-primary hover:underline truncate'
                  >
                    {item.email}
                  </a>
                </div>
              )}
              {item.phone && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Phone className='h-3 w-3' />
                  <a
                    href={`tel:${item.phone}`}
                    className='text-primary hover:underline'
                  >
                    {item.phone}
                  </a>
                </div>
              )}
              {item.itemType === 'contact' && item.companyId && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Building2 className='h-3 w-3' />
                  <span className='truncate'>
                    {getCompanyName(item.companyId)}
                  </span>
                </div>
              )}
              {item.website && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Building2 className='h-3 w-3' />
                  <a
                    href={item.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary hover:underline truncate'
                  >
                    {item.website}
                  </a>
                </div>
              )}
            </div>

            {item.notes && (
              <div className='mt-3 pt-3 border-t'>
                <p className='text-xs text-muted-foreground line-clamp-2'>
                  {item.notes}
                </p>
              </div>
            )}

            {item.tags && item.tags.length > 0 && (
              <div className='mt-3 pt-3 border-t'>
                <div className='flex flex-wrap gap-1'>
                  {item.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant='outline' className='text-xs'>
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant='outline' className='text-xs'>
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Add line-clamp utility if not available
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
}
