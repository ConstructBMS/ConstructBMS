import { Database, Mail, Webhook } from 'lucide-react';
import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui';

export function Integrations() {
  const [emailSettings, setEmailSettings] = useState({
    fromName: 'ConstructBMS',
    fromEmail: 'noreply@constructbms.com',
    smtpDomain: 'smtp.constructbms.com',
  });

  const [storageSettings, setStorageSettings] = useState({
    bucketName: 'constructbms-storage',
    isPublic: false,
  });

  const [webhookSettings, setWebhookSettings] = useState({
    endpointUrl: '',
    signingSecret: '',
  });

  const generateSigningSecret = () => {
    const secret = crypto.randomUUID();
    setWebhookSettings(prev => ({ ...prev, signingSecret: secret }));
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-semibold'>Integrations</h2>
        <p className='text-muted-foreground'>
          Configure external services and integrations.
        </p>
      </div>

      <Tabs defaultValue='email' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='email' className='flex items-center gap-2'>
            <Mail className='h-4 w-4' />
            Email
          </TabsTrigger>
          <TabsTrigger value='storage' className='flex items-center gap-2'>
            <Database className='h-4 w-4' />
            Storage
          </TabsTrigger>
          <TabsTrigger value='webhooks' className='flex items-center gap-2'>
            <Webhook className='h-4 w-4' />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value='email'>
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email settings for notifications and communications
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='from-name' className='text-sm font-medium'>
                  From Name
                </label>
                <Input
                  id='from-name'
                  value={emailSettings.fromName}
                  onChange={e =>
                    setEmailSettings(prev => ({
                      ...prev,
                      fromName: e.target.value,
                    }))
                  }
                  placeholder='Enter from name'
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='from-email' className='text-sm font-medium'>
                  From Email
                </label>
                <Input
                  id='from-email'
                  type='email'
                  value={emailSettings.fromEmail}
                  onChange={e =>
                    setEmailSettings(prev => ({
                      ...prev,
                      fromEmail: e.target.value,
                    }))
                  }
                  placeholder='Enter from email'
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='smtp-domain' className='text-sm font-medium'>
                  SMTP Domain
                </label>
                <Input
                  id='smtp-domain'
                  value={emailSettings.smtpDomain}
                  onChange={e =>
                    setEmailSettings(prev => ({
                      ...prev,
                      smtpDomain: e.target.value,
                    }))
                  }
                  placeholder='Enter SMTP domain'
                />
              </div>

              <div className='pt-4'>
                <Button disabled>Test Send Email</Button>
                <p className='text-xs text-muted-foreground mt-2'>
                  Email testing is not yet implemented
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='storage'>
          <Card>
            <CardHeader>
              <CardTitle>Storage Configuration</CardTitle>
              <CardDescription>Configure file storage settings</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='bucket-name' className='text-sm font-medium'>
                  Bucket Name
                </label>
                <Input
                  id='bucket-name'
                  value={storageSettings.bucketName}
                  onChange={e =>
                    setStorageSettings(prev => ({
                      ...prev,
                      bucketName: e.target.value,
                    }))
                  }
                  placeholder='Enter bucket name'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <Switch
                  id='public-storage'
                  checked={storageSettings.isPublic}
                  onCheckedChange={checked =>
                    setStorageSettings(prev => ({ ...prev, isPublic: checked }))
                  }
                />
                <label htmlFor='public-storage' className='text-sm font-medium'>
                  Public Storage
                </label>
              </div>
              <p className='text-xs text-muted-foreground'>
                When enabled, files will be publicly accessible
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='webhooks'>
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure webhooks for external integrations
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label htmlFor='endpoint-url' className='text-sm font-medium'>
                  Endpoint URL
                </label>
                <Input
                  id='endpoint-url'
                  type='url'
                  value={webhookSettings.endpointUrl}
                  onChange={e =>
                    setWebhookSettings(prev => ({
                      ...prev,
                      endpointUrl: e.target.value,
                    }))
                  }
                  placeholder='https://your-domain.com/webhook'
                />
              </div>

              <div className='space-y-2'>
                <label htmlFor='signing-secret' className='text-sm font-medium'>
                  Signing Secret
                </label>
                <div className='flex gap-2'>
                  <Input
                    id='signing-secret'
                    value={webhookSettings.signingSecret}
                    readOnly
                    placeholder='Click generate to create a secret'
                  />
                  <Button onClick={generateSigningSecret} variant='outline'>
                    Generate
                  </Button>
                </div>
                <p className='text-xs text-muted-foreground'>
                  Use this secret to verify webhook authenticity
                </p>
              </div>

              <div className='pt-4'>
                <Button disabled>Test Webhook</Button>
                <p className='text-xs text-muted-foreground mt-2'>
                  Webhook testing is not yet implemented
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
