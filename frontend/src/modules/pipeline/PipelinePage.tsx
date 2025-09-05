import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';

export default function PipelinePage() {
  return (
    <Page title='Pipeline'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The pipeline module will provide sales pipeline management and
              opportunity tracking capabilities.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
