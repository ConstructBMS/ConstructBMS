import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';

export default function DocumentsPage() {
  return (
    <Page title='Documents'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The documents module will provide document management, version
              control, and collaboration features.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
