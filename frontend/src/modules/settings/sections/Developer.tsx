import { useOrgStore } from '../../../app/store/auth/org.store';
import { useThemeStore } from '../../../app/store/ui/theme.store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui';

export function Developer() {
  const { theme } = useThemeStore();
  const { currentOrgId, getCurrentOrg } = useOrgStore();
  const currentOrg = getCurrentOrg();

  // Get accent color from localStorage
  const accentColor =
    typeof window !== 'undefined'
      ? localStorage.getItem('accent-color') || 'blue'
      : 'blue';

  // Get git SHA from environment (if available)
  const gitSha = import.meta.env.VITE_GIT_SHA || 'Not available';

  // Get package versions
  const packageVersions = {
    vite: import.meta.env.VITE_VERSION || '5.4.19',
    react: '18.2.0',
    tailwind: '3.4.0',
  };

  // Safe environment variables (non-sensitive)
  const safeEnvVars = {
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold'>Developer Information</h2>
        <p className='text-muted-foreground'>
          Technical details and environment information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application State</CardTitle>
          <CardDescription>Current application configuration</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Active Theme
              </label>
              <p className='text-sm font-mono'>{theme}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Accent Color
              </label>
              <p className='text-sm font-mono'>{accentColor}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Current Org ID
              </label>
              <p className='text-sm font-mono'>{currentOrgId || 'None'}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-muted-foreground'>
                Current Org Name
              </label>
              <p className='text-sm font-mono'>{currentOrg?.name || 'None'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Package Versions</CardTitle>
          <CardDescription>Installed package versions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-2'>
            {Object.entries(packageVersions).map(([name, version]) => (
              <div
                key={name}
                className='flex justify-between items-center py-2 border-b last:border-b-0'
              >
                <span className='font-medium capitalize'>{name}</span>
                <span className='text-sm font-mono text-muted-foreground'>
                  {version}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Safe environment variables (non-sensitive)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-2'>
            {Object.entries(safeEnvVars).map(([key, value]) => (
              <div
                key={key}
                className='flex justify-between items-center py-2 border-b last:border-b-0'
              >
                <span className='font-medium'>{key}</span>
                <span className='text-sm font-mono text-muted-foreground'>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Build Information</CardTitle>
          <CardDescription>Build and deployment details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 gap-2'>
            <div className='flex justify-between items-center py-2 border-b'>
              <span className='font-medium'>Git SHA</span>
              <span className='text-sm font-mono text-muted-foreground'>
                {gitSha}
              </span>
            </div>
            <div className='flex justify-between items-center py-2 border-b'>
              <span className='font-medium'>Build Time</span>
              <span className='text-sm font-mono text-muted-foreground'>
                {new Date().toISOString()}
              </span>
            </div>
            <div className='flex justify-between items-center py-2'>
              <span className='font-medium'>User Agent</span>
              <span className='text-sm font-mono text-muted-foreground truncate max-w-xs'>
                {navigator.userAgent}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
