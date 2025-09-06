import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';

export default function NotesPage() {
  return (
    <Page title='Notes'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The notes module will provide a comprehensive note-taking system
              for project documentation and collaboration.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
