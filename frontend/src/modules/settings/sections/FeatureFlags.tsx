import { useFeatureFlagsStore } from '../../../app/store/featureFlags.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '../../../components/ui';
import { FlagKey } from '../../../lib/utils/featureFlags';

const flagLabels: Record<FlagKey, string> = {
  'documents.builder': 'Documents Builder',
  'documents.library': 'Documents Library',
  chat: 'Chat',
  portal: 'Portal',
  programme: 'Programme Manager',
  workflows: 'Workflows',
  pipeline: 'Pipeline',
  estimates: 'Estimates',
  purchaseOrders: 'Purchase Orders',
};

const audienceOptions = [
  { value: 'all', label: 'All Users' },
  { value: 'admins', label: 'Admins Only' },
  { value: 'beta', label: 'Beta Users' },
];

export function FeatureFlags() {
  const { flags, setFlag, resetToDefaults } = useFeatureFlagsStore();

  const handleToggle = (key: FlagKey, enabled: boolean) => {
    const flag = flags.find(f => f.key === key);
    setFlag(key, enabled, flag?.audience);
  };

  const handleAudienceChange = (
    key: FlagKey,
    audience: 'all' | 'admins' | 'beta'
  ) => {
    const flag = flags.find(f => f.key === key);
    setFlag(key, flag?.enabled || false, audience);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-semibold'>Feature Flags</h2>
          <p className='text-muted-foreground'>
            Enable or disable features for your organization.
          </p>
        </div>
        <button
          onClick={resetToDefaults}
          className='text-sm text-muted-foreground hover:text-foreground'
        >
          Reset to Defaults
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
          <CardDescription>
            Toggle features on or off and set their audience
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {flags.map(flag => (
            <div
              key={flag.key}
              className='flex items-center justify-between p-4 border rounded-lg'
            >
              <div className='flex-1'>
                <div className='flex items-center gap-3'>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={enabled => handleToggle(flag.key, enabled)}
                  />
                  <div>
                    <h3 className='font-medium'>{flagLabels[flag.key]}</h3>
                    <p className='text-sm text-muted-foreground'>{flag.key}</p>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Select
                  value={flag.audience || 'all'}
                  onValueChange={value =>
                    handleAudienceChange(
                      flag.key,
                      value as 'all' | 'admins' | 'beta'
                    )
                  }
                  disabled={!flag.enabled}
                >
                  <SelectTrigger className='w-32'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audienceOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How Feature Flags Work</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-muted-foreground'>
          <p>
            • <strong>All Users:</strong> Feature is available to everyone
          </p>
          <p>
            • <strong>Admins Only:</strong> Feature is only available to admin
            and superadmin roles
          </p>
          <p>
            • <strong>Beta Users:</strong> Feature is available to beta, admin,
            and superadmin roles
          </p>
          <p>
            • Disabled features will be hidden from the sidebar and navigation
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
