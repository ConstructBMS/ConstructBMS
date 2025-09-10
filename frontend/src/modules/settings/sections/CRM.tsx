export function CRM() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>CRM Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Configure your customer relationship management settings.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium'>Contact Management</h4>
          <p className='text-sm text-muted-foreground'>
            Manage your contacts, clients, contractors, and consultants.
          </p>
        </div>

        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium'>Lead Tracking</h4>
          <p className='text-sm text-muted-foreground'>
            Track and manage leads through your sales pipeline.
          </p>
        </div>
      </div>
    </div>
  );
}
