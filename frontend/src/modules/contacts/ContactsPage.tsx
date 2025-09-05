import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';

export default function ContactsPage() {
  return (
    <Page title='Contacts'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The contacts module will manage client relationships, vendor
              information, and stakeholder communications.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
