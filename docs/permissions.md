# Permissions System v0 - RBAC + ABAC

## Overview

The ConstructBMS permissions system provides comprehensive access control through a combination of
Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC). This system allows for
fine-grained permission management with support for scoped access, inheritance, and dynamic rule
evaluation.

## Core Concepts

### Permission Decision Types

- **`allow`**: Explicitly grants access to a resource/action
- **`deny`**: Explicitly denies access to a resource/action (overrides allow)
- **`inherit`**: Falls back to parent scope or default behavior

### Scopes

- **`global`**: System-wide permissions
- **`organization`**: Organization-specific permissions
- **`project`**: Project-specific permissions
- **`user`**: User-specific permissions

### Resources and Actions

**Resources**: `dashboard`, `projects`, `programme`, `contacts`, `documents`, `workflows`,
`pipeline`, `estimates`, `purchase-orders`, `notes`, `chat`, `portal`, `settings`, `users`, `roles`,
`permissions`

**Actions**: `read`, `create`, `update`, `delete`, `manage`, `export`, `import`, `approve`, `reject`

## Architecture

### Core Components

1. **Permission Evaluator** (`evaluator.ts`)
   - Core logic for permission evaluation
   - Supports deny overrides, ABAC predicates, and caching
   - Handles rule inheritance and scope resolution

2. **React Hooks** (`hooks.tsx`)
   - `useCan()` - Check single permission
   - `useCanMultiple()` - Check multiple permissions
   - `useCanAny()` - Check if user has any of specified permissions
   - `useCanAll()` - Check if user has all specified permissions

3. **Guard Components** (`Guard.tsx`)
   - `Guard` - General permission guard
   - `RouteGuard` - Route protection with redirect
   - `UIGuard` - UI element protection
   - `ButtonGuard` - Button state management

4. **Zustand Store** (`store.ts`)
   - Manages permission rules, roles, and matrix
   - Persists to localStorage for offline capability
   - Provides actions for CRUD operations

5. **Matrix UI** (`PermissionsPage.tsx`)
   - Visual permission matrix editor
   - Scope selection and ABAC rule configuration
   - Test and save functionality

## Usage Examples

### Basic Permission Check

```tsx
import { useCan } from '@/lib/permissions/hooks';

function ProjectList() {
  const { can, isLoading, error } = useCan({
    resource: 'projects',
    action: 'read',
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!can) return <div>Access denied</div>;

  return <div>Project list content</div>;
}
```

### Route Protection

```tsx
import { RouteGuard } from '@/lib/permissions/Guard';

function App() {
  return (
    <Routes>
      <Route
        path='/projects'
        element={
          <RouteGuard resource='projects' action='read' redirectTo='/unauthorized'>
            <ProjectsPage />
          </RouteGuard>
        }
      />
    </Routes>
  );
}
```

### UI Element Protection

```tsx
import { UIGuard } from '@/lib/permissions/Guard';

function ProjectActions({ projectId }) {
  return (
    <div>
      <UIGuard resource='projects' action='update' scope='project' scopeId={projectId}>
        <button>Edit Project</button>
      </UIGuard>

      <UIGuard resource='projects' action='delete' scope='project' scopeId={projectId}>
        <button>Delete Project</button>
      </UIGuard>
    </div>
  );
}
```

### Multiple Permission Check

```tsx
import { useCanAny } from '@/lib/permissions/hooks';

function AdminPanel() {
  const { can } = useCanAny([
    { resource: 'users', action: 'manage' },
    { resource: 'roles', action: 'manage' },
    { resource: 'permissions', action: 'manage' },
  ]);

  if (!can) return null;

  return <div>Admin panel content</div>;
}
```

## ABAC (Attribute-Based Access Control)

### Rule Structure

```typescript
interface ABACRule {
  id: string;
  name: string;
  conditions: ABACCondition[];
  logic: 'AND' | 'OR';
}

interface ABACCondition {
  attribute: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'in'
    | 'not_in'
    | 'contains'
    | 'starts_with'
    | 'ends_with'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte';
  value: string | number | boolean | string[];
}
```

### Example ABAC Rule

```json
{
  "id": "department-access",
  "name": "Engineering Department Access",
  "conditions": [
    {
      "attribute": "department",
      "operator": "equals",
      "value": "engineering"
    },
    {
      "attribute": "level",
      "operator": "gte",
      "value": 5
    }
  ],
  "logic": "AND"
}
```

### Context Attributes

The evaluator checks attributes in this order:

1. **User Attributes**: `context.userAttributes`
2. **Resource Attributes**: `context.resourceAttributes`
3. **Environment Attributes**: `context.environmentAttributes`

## Permission Matrix

The permission matrix provides a visual interface for managing permissions:

- **Green (Allow)**: User can perform the action
- **Red (Deny)**: User cannot perform the action
- **Gray (Inherit)**: Falls back to parent scope or default

### Matrix Operations

1. **Click cells** to cycle through Allow → Deny → Inherit
2. **Select scope** to filter permissions by scope
3. **Test permissions** to validate rule evaluation
4. **Save changes** to persist to backend

## Default Roles

### SuperAdmin

- Full system access
- Can manage all resources and actions
- Can manage roles and permissions

### Admin

- Administrative access to most features
- Cannot delete users or manage roles/permissions
- Can manage projects and organizational settings

### Manager

- Project and team management
- Cannot manage users, roles, or permissions
- Can oversee projects and team members

### Staff

- Standard employee access
- Cannot create projects or manage users
- Can work on assigned projects and collaborate

### Contractor

- Limited external access
- Can view assigned projects and submit deliverables
- Cannot manage projects or users

### Client

- Read-only access
- Can view project progress and communicate
- Cannot access internal workflows or settings

## Database Schema

### Tables

- **`roles`**: System roles (SuperAdmin, Admin, Manager, etc.)
- **`role_bindings`**: User-role assignments with scope support
- **`permission_rules`**: Permission rules for resources and actions

### Key Features

- **Scope Support**: Rules can be scoped to global, organization, project, or user level
- **ABAC Rules**: JSON-based attribute conditions
- **Audit Trail**: Created/updated timestamps and user tracking
- **Performance**: Indexed for fast permission evaluation

## Evaluation Logic

### Rule Matching

1. **Resource/Action Match**: Rule must match the requested resource and action
2. **Scope Match**: Rule scope must match the evaluation context scope
3. **Scope ID Match**: If specified, scope ID must match exactly

### Decision Priority

1. **Deny Override**: Any explicit deny rule takes precedence
2. **Allow Rules**: Explicit allow rules grant access (subject to ABAC)
3. **Inherit**: Default behavior when no explicit rules match

### ABAC Evaluation

1. **Condition Evaluation**: Each condition is evaluated against context attributes
2. **Logic Application**: AND/OR logic is applied to condition results
3. **Rule Result**: ABAC rule passes if conditions are satisfied

## Caching

### Cache Strategy

- **In-Memory Cache**: 5-minute TTL for evaluation results
- **Cache Key**: Based on context, resource, and action
- **Cache Invalidation**: Cleared when rules change

### Performance Benefits

- **Reduced Evaluation**: Cached results avoid re-evaluation
- **Faster UI**: Quick permission checks for UI rendering
- **Scalability**: Reduces computational overhead

## Testing

### Test Coverage

- **Basic Evaluation**: Allow, deny, inherit scenarios
- **Deny Override**: Multiple rules with deny precedence
- **Scope Matching**: Global, project, and user scopes
- **ABAC Rules**: Condition evaluation and logic
- **Caching**: Cache behavior and invalidation
- **Edge Cases**: Empty rules, invalid operators, missing attributes

### Running Tests

```bash
# Run permission evaluator tests
pnpm test frontend/src/lib/permissions/__tests__/evaluator.test.ts

# Run all tests
pnpm test
```

## Best Practices

### Permission Design

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Explicit Deny**: Use deny rules sparingly, prefer inherit
3. **Scope Appropriately**: Use project/user scopes for fine-grained control
4. **ABAC for Dynamic Rules**: Use attributes for context-dependent permissions

### Performance

1. **Cache-Friendly**: Design rules to maximize cache hits
2. **Indexed Queries**: Database indexes support fast rule lookup
3. **Batch Operations**: Use multiple permission checks efficiently
4. **Lazy Loading**: Load permissions only when needed

### Security

1. **Validate Inputs**: Sanitize ABAC conditions and values
2. **Audit Changes**: Track permission rule modifications
3. **Test Thoroughly**: Validate permission logic with comprehensive tests
4. **Monitor Access**: Log permission evaluations for security analysis

## Troubleshooting

### Common Issues

1. **Permission Denied**: Check rule scope and ABAC conditions
2. **Cache Issues**: Clear cache when rules change
3. **ABAC Failures**: Verify attribute names and operators
4. **Scope Mismatch**: Ensure context scope matches rule scope

### Debug Tools

1. **Permission Debug Hook**: `usePermissionDebug()` for detailed evaluation
2. **Test Matrix**: Use the permissions page test functionality
3. **Console Logging**: Enable debug logging in evaluator
4. **Cache Stats**: Monitor cache performance and hit rates

## Future Enhancements

### Planned Features

1. **Time-Based Rules**: Permissions with expiration dates
2. **Conditional Rules**: Rules based on resource state
3. **Permission Templates**: Reusable permission sets
4. **Advanced ABAC**: Complex attribute relationships
5. **Audit Dashboard**: Permission usage analytics
6. **API Integration**: RESTful permission management
7. **Bulk Operations**: Mass permission updates
8. **Permission Delegation**: Temporary permission grants

### Migration Path

The current v0 implementation provides a solid foundation for future enhancements while maintaining
backward compatibility through the permission decision types and evaluation logic.
