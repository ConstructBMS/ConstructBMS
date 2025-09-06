import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';

export default function PurchaseOrdersPage() {
  return (
    <Page title='Purchase Orders'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The purchase orders module will provide procurement management and
              vendor order tracking capabilities.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
