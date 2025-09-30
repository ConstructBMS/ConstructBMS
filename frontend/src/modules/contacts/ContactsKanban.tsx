import { Building2, Edit, Eye, Trash2, User } from 'lucide-react';
import { useState } from 'react';
import { useKanbanStore } from '../../app/store/ui/kanban.store';
import { Button, Card, CardContent } from '../../components/ui';
import type {
  KanbanColumn,
  KanbanItem,
} from '../../components/views/UnifiedKanban';
import { UnifiedKanban } from '../../components/views/UnifiedKanban';
import type { Company, Contact } from '../../lib/types/contacts';

interface ContactsKanbanProps {
  contacts: Contact[];
  companies: Company[];
  onEdit: (item: Contact | Company, type: 'contact' | 'company') => void;
  onDelete: (id: string, type: 'contact' | 'company') => void;
  canEdit?: boolean;
}

export function ContactsKanban({
  contacts,
  companies,
  onEdit,
  onDelete,
  canEdit = true,
}: ContactsKanbanProps) {
  const { getConfig, updateColumns } = useKanbanStore();
  const [localContacts, setLocalContacts] = useState<Contact[]>(contacts);
  const [localCompanies, setLocalCompanies] = useState<Company[]>(companies);

  const moduleId = 'contacts';
  const config = getConfig(moduleId);
  const columns = config?.columns || [];

  // Convert contacts and companies to Kanban items
  const contactItems: KanbanItem[] = localContacts.map(contact => ({
    id: `contact-${contact.id}`,
    title: contact.name,
    description: contact.email,
    status: contact.category || 'new',
    priority: contact.priority || 'medium',
    assignee: contact.company,
    dueDate: contact.createdAt,
    metadata: {
      type: 'contact',
      phone: contact.phone,
      company: contact.company,
      category: contact.category,
      originalId: contact.id,
    },
  }));

  const companyItems: KanbanItem[] = localCompanies.map(company => ({
    id: `company-${company.id}`,
    title: company.name,
    description: company.industry,
    status: company.category || 'new',
    priority: company.priority || 'medium',
    assignee: company.contactPerson,
    dueDate: company.createdAt,
    metadata: {
      type: 'company',
      website: company.website,
      address: company.address,
      category: company.category,
      originalId: company.id,
    },
  }));

  const kanbanItems = [...contactItems, ...companyItems];

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    updateColumns(moduleId, newColumns);
  };

  const handleItemsChange = (newItems: KanbanItem[]) => {
    // Separate contacts and companies
    const updatedContacts: Contact[] = [];
    const updatedCompanies: Company[] = [];

    newItems.forEach(item => {
      const metadata = item.metadata as any;
      if (metadata.type === 'contact') {
        const originalContact = localContacts.find(
          c => c.id === metadata.originalId
        );
        if (originalContact) {
          updatedContacts.push({
            ...originalContact,
            category: item.status as any,
          });
        }
      } else if (metadata.type === 'company') {
        const originalCompany = localCompanies.find(
          c => c.id === metadata.originalId
        );
        if (originalCompany) {
          updatedCompanies.push({
            ...originalCompany,
            category: item.status as any,
          });
        }
      }
    });

    setLocalContacts(updatedContacts);
    setLocalCompanies(updatedCompanies);
  };

  const handleItemClick = (item: KanbanItem) => {
    const metadata = item.metadata as any;
    if (metadata.type === 'contact') {
      const contact = localContacts.find(c => c.id === metadata.originalId);
      if (contact) {
        onEdit(contact, 'contact');
      }
    } else if (metadata.type === 'company') {
      const company = localCompanies.find(c => c.id === metadata.originalId);
      if (company) {
        onEdit(company, 'company');
      }
    }
  };

  const handleItemEdit = (item: KanbanItem) => {
    handleItemClick(item);
  };

  const handleItemDelete = (item: KanbanItem) => {
    const metadata = item.metadata as any;
    if (metadata.type === 'contact') {
      onDelete(metadata.originalId, 'contact');
      setLocalContacts(prev => prev.filter(c => c.id !== metadata.originalId));
    } else if (metadata.type === 'company') {
      onDelete(metadata.originalId, 'company');
      setLocalCompanies(prev => prev.filter(c => c.id !== metadata.originalId));
    }
  };

  const handleAddItem = (columnId: string) => {
    console.log('Add contact/company to column:', columnId);
    // Handle adding new contact or company
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContactItem = (item: KanbanItem) => {
    const metadata = item.metadata as any;
    const isContact = metadata.type === 'contact';

    return (
      <Card className='mb-3 cursor-pointer hover:shadow-md transition-shadow'>
        <CardContent className='p-4'>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-2'>
                {isContact ? (
                  <User className='h-4 w-4 text-blue-600' />
                ) : (
                  <Building2 className='h-4 w-4 text-green-600' />
                )}
                <h4 className='font-semibold text-sm'>{item.title}</h4>
              </div>

              {item.description && (
                <p className='text-xs text-muted-foreground mb-2'>
                  {item.description}
                </p>
              )}

              {/* Priority and Type */}
              <div className='flex items-center gap-2 mb-2'>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority || 'medium')}`}
                >
                  {item.priority?.toUpperCase()}
                </span>
                <span className='text-xs text-muted-foreground'>
                  {isContact ? 'Contact' : 'Company'}
                </span>
              </div>

              {/* Additional Info */}
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                {item.assignee && (
                  <div className='flex items-center gap-1'>
                    <span>👤</span>
                    <span>{item.assignee}</span>
                  </div>
                )}
                {item.dueDate && (
                  <div className='flex items-center gap-1'>
                    <span>📅</span>
                    <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Contact-specific info */}
              {isContact && metadata.phone && (
                <div className='text-xs text-muted-foreground mt-1'>
                  📞 {metadata.phone}
                </div>
              )}

              {/* Company-specific info */}
              {!isContact && metadata.website && (
                <div className='text-xs text-muted-foreground mt-1'>
                  🌐 {metadata.website}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='flex gap-1 ml-2'>
              <Button
                size='sm'
                variant='ghost'
                onClick={e => {
                  e.stopPropagation();
                  handleItemEdit(item);
                }}
              >
                <Edit className='h-3 w-3' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={e => {
                  e.stopPropagation();
                  handleItemClick(item);
                }}
              >
                <Eye className='h-3 w-3' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={e => {
                  e.stopPropagation();
                  handleItemDelete(item);
                }}
              >
                <Trash2 className='h-3 w-3' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <UnifiedKanban
      columns={columns}
      items={kanbanItems}
      onColumnsChange={handleColumnsChange}
      onItemsChange={handleItemsChange}
      onItemClick={handleItemClick}
      onItemEdit={handleItemEdit}
      onItemDelete={handleItemDelete}
      onAddItem={handleAddItem}
      renderItem={renderContactItem}
      canEdit={canEdit}
      moduleId={moduleId}
    />
  );
}
