import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';

export default function DashboardPage() {
  return (
    <Page title='Dashboard'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The dashboard will contain key metrics, recent activity, and quick
              actions for the ConstructBMS system.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
