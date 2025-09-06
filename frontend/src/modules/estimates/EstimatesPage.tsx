import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';

export default function EstimatesPage() {
  return (
    <Page title='Estimates'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Estimates</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The estimates module will provide project cost estimation and
              budget management capabilities.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
