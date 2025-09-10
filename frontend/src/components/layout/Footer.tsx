export default function Footer() {
  return (
    <footer className='border-t mt-8 px-4 sm:px-6 lg:px-8 py-4 text-sm text-muted-foreground'>
      <div className='max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2'>
        <span>© {new Date().getFullYear()} ConstructBMS</span>
        <div className='flex items-center gap-4'>
          <a href='/settings' className='hover:underline'>
            Settings
          </a>
          <a href='/docs' className='hover:underline'>
            Docs
          </a>
          <span className='opacity-70'>v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}
