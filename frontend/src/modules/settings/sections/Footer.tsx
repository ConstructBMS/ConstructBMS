export function Footer() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>Footer Settings</h3>
        <p className='text-sm text-muted-foreground'>
          Configure the application footer content and links.
        </p>
      </div>

      <div className='space-y-4'>
        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium'>Footer Content</h4>
          <p className='text-sm text-muted-foreground'>
            Customize the footer text, links, and branding.
          </p>
        </div>

        <div className='p-4 border rounded-lg bg-card'>
          <h4 className='font-medium'>Social Links</h4>
          <p className='text-sm text-muted-foreground'>
            Add social media links and contact information.
          </p>
        </div>
      </div>
    </div>
  );
}
