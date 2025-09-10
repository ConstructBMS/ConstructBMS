export function About() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>About ConstructBMS</h3>
        <p className='text-sm text-muted-foreground'>
          Information about the application and system details.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium'>Application Version</h4>
          <p className='text-sm text-muted-foreground'>v0.1.0</p>
        </div>

        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium'>System Information</h4>
          <p className='text-sm text-muted-foreground'>
            Built with React, TypeScript, Tailwind CSS, and Supabase.
          </p>
        </div>

        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium'>Support</h4>
          <p className='text-sm text-muted-foreground'>
            For support and documentation, visit our help center.
          </p>
        </div>
      </div>
    </div>
  );
}
