/**
 * Permissions Page - Matrix Editor UI
 *
 * This page provides a comprehensive interface for managing permissions
 * with a matrix editor, scope selection, and advanced ABAC rule configuration.
 */

import {
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Shield,
  TestTube,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Page } from '../../components/layout/Page';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui';
import type {
  Action,
  PermissionDecision,
  Resource,
  Scope,
} from '../../lib/types/permissions';
import {
  loadDefaultRoles,
  saveRules,
  testPermission,
  usePermissionStore,
} from './store';

// ============================================================================
// Constants
// ============================================================================

const RESOURCES: Resource[] = [
  'dashboard',
  'projects',
  'programme',
  'contacts',
  'documents',
  'workflows',
  'pipeline',
  'estimates',
  'purchase-orders',
  'notes',
  'chat',
  'portal',
  'settings',
  'users',
  'roles',
  'permissions',
];

const ACTIONS: Action[] = [
  'read',
  'create',
  'update',
  'delete',
  'manage',
  'export',
  'import',
  'approve',
  'reject',
];

const SCOPES: { value: Scope; label: string }[] = [
  { value: 'global', label: 'Global' },
  { value: 'organization', label: 'Organization' },
  { value: 'project', label: 'Project' },
  { value: 'user', label: 'User' },
];

// ============================================================================
// Permission Matrix Cell Component
// ============================================================================

interface PermissionCellProps {
  resource: Resource;
  action: Action;
  decision: PermissionDecision;
  onDecisionChange: (
    resource: Resource,
    action: Action,
    decision: PermissionDecision
  ) => void;
  disabled?: boolean;
}

function PermissionCell({
  resource,
  action,
  decision,
  onDecisionChange,
  disabled,
}: PermissionCellProps) {
  const getDecisionColor = (decision: PermissionDecision) => {
    switch (decision) {
      case 'allow':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deny':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inherit':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDecisionIcon = (decision: PermissionDecision) => {
    switch (decision) {
      case 'allow':
        return <Eye className='h-3 w-3' />;
      case 'deny':
        return <EyeOff className='h-3 w-3' />;
      case 'inherit':
        return <span className='text-xs'>-</span>;
      default:
        return <span className='text-xs'>-</span>;
    }
  };

  const cycleDecision = () => {
    if (disabled) return;

    const nextDecision: PermissionDecision =
      decision === 'inherit'
        ? 'allow'
        : decision === 'allow'
          ? 'deny'
          : 'inherit';

    onDecisionChange(resource, action, nextDecision);
  };

  return (
    <button
      onClick={cycleDecision}
      disabled={disabled}
      className={`
        w-full h-8 flex items-center justify-center text-xs font-medium
        border rounded transition-colors hover:opacity-80
        ${getDecisionColor(decision)}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={`${resource}:${action} - ${decision}`}
    >
      {getDecisionIcon(decision)}
    </button>
  );
}

// ============================================================================
// Permission Matrix Component
// ============================================================================

interface PermissionMatrixProps {
  matrix: Record<string, Record<string, PermissionDecision>>;
  onCellChange: (
    resource: Resource,
    action: Action,
    decision: PermissionDecision
  ) => void;
  disabled?: boolean;
}

function PermissionMatrix({
  matrix,
  onCellChange,
  disabled,
}: PermissionMatrixProps) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className='border p-2 text-left font-medium bg-muted'>
              Resource
            </th>
            {ACTIONS.map(action => (
              <th
                key={action}
                className='border p-2 text-center font-medium bg-muted min-w-[60px]'
              >
                {action}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RESOURCES.map(resource => (
            <tr key={resource}>
              <td className='border p-2 font-medium bg-muted/50'>{resource}</td>
              {ACTIONS.map(action => (
                <td key={action} className='border p-1'>
                  <PermissionCell
                    resource={resource}
                    action={action}
                    decision={matrix[resource]?.[action] || 'inherit'}
                    onDecisionChange={onCellChange}
                    disabled={disabled}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// ABAC Rule Editor Component
// ============================================================================

interface ABACRuleEditorProps {
  onSave: (rule: {
    id: string;
    name: string;
    conditions: Array<{ attribute: string; operator: string; value: string }>;
    logic: 'AND' | 'OR';
  }) => void;
  onCancel: () => void;
}

function ABACRuleEditor({ onSave, onCancel }: ABACRuleEditorProps) {
  const [ruleName, setRuleName] = useState('');
  const [conditions, setConditions] = useState<
    Array<{ attribute: string; operator: string; value: string }>
  >([]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { attribute: '', operator: 'equals', value: '' },
    ]);
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const rule = {
      id: `abac_${Date.now()}`,
      name: ruleName,
      conditions,
      logic: 'AND' as const,
    };
    onSave(rule);
  };

  return (
    <div className='space-y-4'>
      <div>
        <label className='block text-sm font-medium mb-2'>Rule Name</label>
        <Input
          value={ruleName}
          onChange={e => setRuleName(e.target.value)}
          placeholder='Enter rule name'
        />
      </div>

      <div>
        <div className='flex items-center justify-between mb-2'>
          <label className='block text-sm font-medium'>Conditions</label>
          <Button onClick={addCondition} size='sm' variant='outline'>
            <Plus className='h-4 w-4 mr-1' />
            Add Condition
          </Button>
        </div>

        {conditions.map((condition, index) => (
          <div key={index} className='flex items-center space-x-2 mb-2'>
            <Input
              value={condition.attribute}
              onChange={e =>
                updateCondition(index, 'attribute', e.target.value)
              }
              placeholder='Attribute'
              className='flex-1'
            />
            <Select
              value={condition.operator}
              onValueChange={value => updateCondition(index, 'operator', value)}
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='equals'>Equals</SelectItem>
                <SelectItem value='not_equals'>Not Equals</SelectItem>
                <SelectItem value='in'>In</SelectItem>
                <SelectItem value='not_in'>Not In</SelectItem>
                <SelectItem value='contains'>Contains</SelectItem>
                <SelectItem value='gt'>Greater Than</SelectItem>
                <SelectItem value='lt'>Less Than</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={condition.value}
              onChange={e => updateCondition(index, 'value', e.target.value)}
              placeholder='Value'
              className='flex-1'
            />
            <Button
              onClick={() => removeCondition(index)}
              size='sm'
              variant='outline'
              className='text-red-600'
            >
              ×
            </Button>
          </div>
        ))}
      </div>

      <div className='flex justify-end space-x-2'>
        <Button onClick={onCancel} variant='outline'>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!ruleName || conditions.length === 0}
        >
          Save Rule
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Permissions Page Component
// ============================================================================

export default function PermissionsPage() {
  const {
    matrix,
    selectedScope,
    selectedScopeId,
    isLoading,
    error,
    updateMatrixCell,
    setSelectedScope,
    setError,
  } = usePermissionStore();

  const [showABACEditor, setShowABACEditor] = useState(false);
  const [testUserId] = useState('test-user');
  const [testResults, setTestResults] = useState<
    Array<{
      resource: string;
      action: string;
      decision: string;
      reason: string;
    }>
  >([]);

  // Load default roles on mount
  useEffect(() => {
    loadDefaultRoles();
  }, []);

  const handleCellChange = (
    resource: Resource,
    action: Action,
    decision: PermissionDecision
  ) => {
    updateMatrixCell(resource, action, decision);
  };

  const handleScopeChange = (scope: Scope) => {
    setSelectedScope(scope);
  };

  const handleSave = async () => {
    try {
      await saveRules();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to save permissions'
      );
    }
  };

  const handleRevert = () => {
    loadDefaultRoles();
  };

  const handleTest = () => {
    const results = [];
    for (const resource of RESOURCES.slice(0, 3)) {
      // Test first 3 resources
      for (const action of ACTIONS.slice(0, 3)) {
        // Test first 3 actions
        const result = testPermission(
          testUserId,
          resource,
          action,
          selectedScope,
          selectedScopeId
        );
        results.push({
          resource,
          action,
          ...result,
        });
      }
    }
    setTestResults(results);
  };

  return (
    <Page title='Permissions Management'>
      <div className='space-y-6'>
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center space-x-2'>
              <Shield className='h-5 w-5' />
              <span>Permission Matrix</span>
            </CardTitle>
            <CardDescription>
              Manage role-based and attribute-based access control permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Scope
                  </label>
                  <Select
                    value={selectedScope}
                    onValueChange={handleScopeChange}
                  >
                    <SelectTrigger className='w-40'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCOPES.map(scope => (
                        <SelectItem key={scope.value} value={scope.value}>
                          {scope.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedScope !== 'global' && (
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Scope ID
                    </label>
                    <Input
                      value={selectedScopeId || ''}
                      onChange={e =>
                        setSelectedScope(selectedScope, e.target.value)
                      }
                      placeholder='Enter scope ID'
                      className='w-40'
                    />
                  </div>
                )}
              </div>

              <div className='flex items-center space-x-2'>
                <Dialog open={showABACEditor} onOpenChange={setShowABACEditor}>
                  <DialogTrigger asChild>
                    <Button variant='outline' size='sm'>
                      <Settings className='h-4 w-4 mr-1' />
                      ABAC Rules
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-2xl'>
                    <DialogHeader>
                      <DialogTitle>ABAC Rule Editor</DialogTitle>
                      <DialogDescription>
                        Create attribute-based access control rules
                      </DialogDescription>
                    </DialogHeader>
                    <ABACRuleEditor
                      onSave={rule => {
                        console.log('ABAC Rule saved:', rule);
                        setShowABACEditor(false);
                      }}
                      onCancel={() => setShowABACEditor(false)}
                    />
                  </DialogContent>
                </Dialog>

                <Button onClick={handleTest} variant='outline' size='sm'>
                  <TestTube className='h-4 w-4 mr-1' />
                  Test
                </Button>

                <Button onClick={handleRevert} variant='outline' size='sm'>
                  <RotateCcw className='h-4 w-4 mr-1' />
                  Revert
                </Button>

                <Button onClick={handleSave} size='sm' disabled={isLoading}>
                  <Save className='h-4 w-4 mr-1' />
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className='border-red-200 bg-red-50'>
            <CardContent className='pt-6'>
              <div className='text-red-800 text-sm'>{error}</div>
            </CardContent>
          </Card>
        )}

        {/* Permission Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Matrix</CardTitle>
            <CardDescription>
              Click cells to toggle between Allow, Deny, and Inherit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              </div>
            ) : (
              <PermissionMatrix
                matrix={matrix}
                onCellChange={handleCellChange}
                disabled={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <CardDescription>
                Permission evaluation results for user: {testUserId}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-2 border rounded'
                  >
                    <span className='font-medium'>
                      {result.resource}:{result.action}
                    </span>
                    <Badge
                      variant={
                        result.decision === 'allow' ? 'default' : 'secondary'
                      }
                    >
                      {result.decision}
                    </Badge>
                    <span className='text-sm text-muted-foreground'>
                      {result.reason}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center'>
                  <Eye className='h-3 w-3 text-green-800' />
                </div>
                <span className='text-sm'>Allow</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center'>
                  <EyeOff className='h-3 w-3 text-red-800' />
                </div>
                <span className='text-sm'>Deny</span>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 bg-gray-100 border border-gray-200 rounded flex items-center justify-center'>
                  <span className='text-xs text-gray-800'>-</span>
                </div>
                <span className='text-sm'>Inherit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
