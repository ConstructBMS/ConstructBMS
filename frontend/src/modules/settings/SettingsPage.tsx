import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';

export default function SettingsPage() {
  return (
    <Page title='Settings'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The settings module will provide system configuration, user
              preferences, and administrative controls.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
