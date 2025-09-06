import { Page } from '../../components/layout/Page';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui';

export default function ProjectsPage() {
  return (
    <Page title='Projects'>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              This is a placeholder page created during Prompt-001 for the
              AppShell, routing, and theme system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground'>
              The projects module will provide comprehensive project management
              capabilities including planning, tracking, and reporting.
            </p>
          </CardContent>
        </Card>
      </div>
    </Page>
  );
}
