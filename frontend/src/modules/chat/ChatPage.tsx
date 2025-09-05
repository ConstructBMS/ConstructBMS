import React from 'react';
import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';

export default function ChatPage() {
  return (
    <Page title='Chat'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The chat module will provide real-time communication for team
              collaboration and project discussions.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
