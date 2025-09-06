import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';

export default function PortalPage() {
  return (
    <Page title='Portal'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Portal</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The portal module will provide external access and integration
              points for clients and partners.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
