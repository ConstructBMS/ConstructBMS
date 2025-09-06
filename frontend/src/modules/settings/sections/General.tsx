import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '../../../components/ui';

export function General() {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold'>General Settings</h2>
        <p className='text-muted-foreground'>
          Manage your organization's basic information and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Profile</CardTitle>
          <CardDescription>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='org-name' className='text-sm font-medium'>
              Organization Name
            </label>
            <Input
              id='org-name'
              placeholder='Enter organization name'
              defaultValue='ConstructBMS'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='timezone' className='text-sm font-medium'>
              Timezone
            </label>
            <select
              id='timezone'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='UTC'>UTC</option>
              <option value='America/New_York'>Eastern Time</option>
              <option value='America/Chicago'>Central Time</option>
              <option value='America/Denver'>Mountain Time</option>
              <option value='America/Los_Angeles'>Pacific Time</option>
              <option value='Europe/London'>London</option>
              <option value='Europe/Paris'>Paris</option>
              <option value='Asia/Tokyo'>Tokyo</option>
            </select>
          </div>

          <div className='space-y-2'>
            <label htmlFor='currency' className='text-sm font-medium'>
              Currency
            </label>
            <select
              id='currency'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='USD'>USD - US Dollar</option>
              <option value='EUR'>EUR - Euro</option>
              <option value='GBP'>GBP - British Pound</option>
              <option value='CAD'>CAD - Canadian Dollar</option>
              <option value='AUD'>AUD - Australian Dollar</option>
            </select>
          </div>

          <div className='space-y-2'>
            <label htmlFor='locale' className='text-sm font-medium'>
              Locale
            </label>
            <select
              id='locale'
              className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <option value='en-US'>English (US)</option>
              <option value='en-GB'>English (UK)</option>
              <option value='fr-FR'>Français</option>
              <option value='de-DE'>Deutsch</option>
              <option value='es-ES'>Español</option>
            </select>
          </div>

          <div className='space-y-2'>
            <label htmlFor='logo' className='text-sm font-medium'>
              Organization Logo
            </label>
            <div className='flex items-center gap-4'>
              <div className='h-16 w-16 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center'>
                <span className='text-xs text-muted-foreground'>Logo</span>
              </div>
              <Button variant='outline' disabled>
                Upload Logo
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              Upload a logo for your organization (PNG, JPG, SVG up to 2MB)
            </p>
          </div>

          <div className='pt-4'>
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
