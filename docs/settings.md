# Settings & Configuration

The ConstructBMS settings system provides comprehensive configuration options for organizations,
users, and developers.

## Overview

The settings system is organized into several key areas:

- **General**: Organization profile and basic preferences
- **Appearance**: Theme and visual customization
- **Feature Flags**: Feature enablement and audience controls
- **Users & Roles**: User management (links to `/users`)
- **Permissions**: Permission management (links to `/permissions`)
- **Integrations**: External service configurations
- **Developer**: Technical information and debugging tools
- **About**: Application information

## Organization Switcher

The organization switcher in the topbar allows users to switch between different organizations they
have access to.

### Features

- **Multi-org Support**: Switch between multiple organizations
- **Persistent Selection**: Current organization is saved in localStorage
- **Visual Indicators**: Organization avatars and names
- **Dropdown Interface**: Clean, accessible dropdown selection

### Usage

```tsx
import { useOrgStore } from '../app/store/auth/org.store';

function MyComponent() {
  const { currentOrgId, orgs, setOrg, getCurrentOrg } = useOrgStore();
  const currentOrg = getCurrentOrg();

  return (
    <div>
      <h1>Current Organization: {currentOrg?.name}</h1>
      <select value={currentOrgId} onChange={e => setOrg(e.target.value)}>
        {orgs.map(org => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Feature Flags

Feature flags provide granular control over which features are available to different user
audiences.

### Flag Types

- **All Users**: Feature available to everyone
- **Admins Only**: Feature restricted to admin and superadmin roles
- **Beta Users**: Feature available to beta, admin, and superadmin roles

### Available Flags

- `documents.builder` - Document builder functionality
- `documents.library` - Document library access
- `chat` - Chat functionality
- `portal` - Portal access
- `programme` - Programme manager
- `workflows` - Workflow management
- `pipeline` - Pipeline functionality
- `estimates` - Estimates management
- `purchaseOrders` - Purchase order management

### Usage

```tsx
import { useFeatureFlag } from '../app/store/featureFlags.store';

function MyComponent() {
  const chatEnabled = useFeatureFlag('chat');
  const portalEnabled = useFeatureFlag('portal', { roles: ['admin'] });

  return (
    <div>
      {chatEnabled && <ChatWidget />}
      {portalEnabled && <PortalLink />}
    </div>
  );
}
```

### Sidebar Integration

The sidebar automatically hides navigation items when their corresponding feature flags are
disabled:

```tsx
const navigationItems = [
  { id: 'chat', label: 'Chat', href: '/chat', flag: 'chat' },
  { id: 'portal', label: 'Portal', href: '/portal', flag: 'portal' },
  // Items will be hidden if flags are disabled
];
```

## Appearance Settings

### Theme System

- **Light Theme**: Clean, bright interface
- **Dark Theme**: Dark interface for low-light environments
- **System Theme**: Automatically follows system preference

### Accent Colors

Five preset accent colors are available:

- **Blue**: Default primary color
- **Indigo**: Professional purple-blue
- **Emerald**: Fresh green
- **Amber**: Warm orange-yellow
- **Rose**: Vibrant pink-red

### Implementation

Themes and accent colors are applied via CSS custom properties:

```css
:root {
  --primary: 221.2 83.2% 53.3%; /* Blue */
  --primary-foreground: 210 40% 98%;
}

.dark {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
}
```

## General Settings

### Organization Profile

- **Name**: Organization display name
- **Timezone**: Default timezone for the organization
- **Currency**: Default currency for financial data
- **Locale**: Language and region settings
- **Logo**: Organization logo (placeholder for future implementation)

### Configuration

All settings are stored in localStorage and persist across sessions. Future versions will integrate
with backend APIs for multi-user synchronization.

## Integrations

### Email Configuration

- **From Name**: Display name for outgoing emails
- **From Email**: Sender email address
- **SMTP Domain**: SMTP server configuration
- **Test Send**: Email testing functionality (placeholder)

### Storage Configuration

- **Bucket Name**: File storage bucket identifier
- **Public/Private Toggle**: Access control for stored files

### Webhooks

- **Endpoint URL**: Webhook destination URL
- **Signing Secret**: Security token for webhook verification
- **Test Event**: Webhook testing functionality (placeholder)

## Developer Tools

### Environment Information

- **Build Environment**: Development, staging, or production
- **Package Versions**: Vite, React, Tailwind versions
- **Git SHA**: Current commit hash (if available)
- **Build Time**: Application build timestamp

### Application State

- **Active Theme**: Current theme setting
- **Accent Color**: Current accent color
- **Organization ID**: Current organization identifier
- **User Agent**: Browser information

## Extensibility

### Adding New Settings

1. **Create Section Component**: Add new component in `frontend/src/modules/settings/sections/`
2. **Update SettingsPage**: Add new tab to the settings navigation
3. **Add Store**: Create Zustand store for setting persistence
4. **Update Documentation**: Document new settings in this file

### Adding New Feature Flags

1. **Update Flag Types**: Add new flag to `FlagKey` type in `featureFlags.ts`
2. **Add Default Flag**: Include in `defaultFlags` array
3. **Update UI**: Add flag to FeatureFlags settings page
4. **Implement Gating**: Use flag in components and navigation

### Adding New Organizations

1. **Update Store**: Add organization to `mockOrgs` in `org.store.ts`
2. **Backend Integration**: Connect to organization API (future)
3. **User Management**: Implement organization membership (future)

## Best Practices

### Feature Flags

- Use feature flags for new features during development
- Test with different audience settings
- Remove flags after features are stable
- Document flag purposes and audiences

### Organization Management

- Keep organization names concise and clear
- Use consistent naming conventions
- Implement proper access controls
- Consider organization-specific settings

### Settings Persistence

- Use localStorage for client-side settings
- Implement proper error handling
- Provide sensible defaults
- Consider settings migration strategies

## Future Enhancements

### Planned Features

- **Backend Integration**: API-based settings storage
- **User Preferences**: Individual user settings
- **Organization Settings**: Organization-wide configurations
- **Settings Import/Export**: Backup and restore functionality
- **Audit Logging**: Track settings changes
- **Role-based Settings**: Different settings for different roles

### Technical Improvements

- **Real-time Sync**: Live settings updates across users
- **Validation**: Server-side settings validation
- **Encryption**: Secure storage of sensitive settings
- **Performance**: Optimized settings loading and caching
