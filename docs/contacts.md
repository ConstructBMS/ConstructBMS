# Contacts & Companies Module

The Contacts module provides comprehensive contact and company management functionality for
ConstructBMS.

## Overview

The Contacts module allows users to:

- Manage individual contacts (people)
- Store and organize company information
- Link contacts to companies
- Search and filter contacts and companies
- Use tags for categorization
- Store custom fields as JSON data

## Data Model

### Contact Interface

```typescript
interface Contact {
  id: string;
  type: 'person' | 'company';
  name: string;
  email?: string;
  phone?: string;
  companyId?: string;
  notes?: string;
  tags?: string[];
  custom?: Record<string, any>;
  createdAt: string;
}
```

### Company Interface

```typescript
interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  custom?: Record<string, any>;
  createdAt: string;
}
```

## Store Functions

The Zustand store (`frontend/src/modules/contacts/store.ts`) provides the following actions:

### Contact Management

- `addContact(contactData)` - Add a new contact
- `updateContact(id, updates)` - Update an existing contact
- `removeContact(id)` - Remove a contact
- `getContact(id)` - Get a contact by ID

### Company Management

- `addCompany(companyData)` - Add a new company
- `updateCompany(id, updates)` - Update an existing company
- `removeCompany(id)` - Remove a company
- `getCompany(id)` - Get a company by ID

### Search & Filter

- `searchContacts(query)` - Search contacts by name, email, phone, or tags
- `searchCompanies(query)` - Search companies by name, email, phone, or tags
- `getContactsByCompany(companyId)` - Get all contacts for a specific company

### Data Persistence

- All data is persisted to localStorage using Zustand's persist middleware
- Data structure: `{ contacts: Contact[], companies: Company[] }`

## UI Components

### ContactsPage

Main page component that orchestrates the entire contacts interface.

**Features:**

- View mode toggle (List/Grid)
- Search functionality
- Filter by type (All/People/Companies)
- Add Contact/Company buttons
- Results count display

### ContactsList

Table view component for displaying contacts and companies.

**Features:**

- Sortable columns (Name, Type, Email, Phone, Company, Tags)
- Action buttons (Edit/Delete)
- Responsive design
- Empty state handling

### ContactsGrid

Card view component for displaying contacts and companies.

**Features:**

- Card-based layout
- Avatar/icon display
- Compact information display
- Tag visualization
- Action buttons

### ContactForm

Modal form for adding and editing contacts and companies.

**Features:**

- Tabbed interface (Basic Info, Details, Advanced)
- Type selection (Person/Company)
- Form validation
- Tag management
- Custom fields JSON editor
- Company selection for contacts

## Migration Schema

The database migration (`database/migrations/2025-09-07_contacts.sql`) creates:

### Companies Table

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Contacts Table

```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('person', 'company')),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    custom JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

- Name indexes for both tables
- Email indexes for search performance
- GIN indexes for tags and custom JSONB fields
- Company reference index for contacts

## Extension Points

### Custom Fields

The `custom` field accepts any JSON structure, allowing for:

- Additional contact/company properties
- Integration-specific data
- User-defined fields
- Metadata storage

### Tags System

Tags are stored as string arrays and support:

- Color coding (handled in UI)
- Multiple tags per item
- Search and filtering
- Categorization

### Company Relations

Contacts can be linked to companies via `companyId`:

- Optional relationship
- Cascade delete handling
- Company contact listing
- Hierarchical organization

## Permissions

The contacts module is protected by:

- **Feature Flag**: `contacts` (enabled by default)
- **Route Guard**: `resource='contacts' action='read'`
- **Permission Matrix**: Integrated with RBAC/ABAC system

## Testing

The module includes comprehensive tests (`frontend/src/modules/contacts/__tests__/store.test.ts`):

- Store action testing
- Data persistence verification
- Search functionality validation
- CRUD operations testing
- Edge case handling

## Usage Examples

### Adding a Contact

```typescript
const { addContact } = useContactsStore();

addContact({
  type: 'person',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1-555-0123',
  companyId: 'company-uuid',
  tags: ['manager', 'senior'],
  notes: 'Project manager for downtown office',
});
```

### Searching Contacts

```typescript
const { searchContacts } = useContactsStore();

const results = searchContacts('john');
// Returns contacts matching 'john' in name, email, phone, or tags
```

### Adding Custom Fields

```typescript
addContact({
  type: 'person',
  name: 'Jane Smith',
  custom: {
    department: 'Engineering',
    employeeId: 'EMP001',
    startDate: '2023-01-15',
  },
});
```

## Future Enhancements

Potential improvements for the contacts module:

- Bulk import/export functionality
- Contact merging capabilities
- Advanced filtering options
- Contact history tracking
- Integration with external CRM systems
- Contact photo uploads
- Advanced search with multiple criteria
- Contact templates
- Automated tagging based on rules
