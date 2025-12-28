import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className='min-h-screen bg-slate-50'>
      <TopBar />
      <main className='mx-auto max-w-5xl p-4'>
        <Outlet />
      </main>
    </div>
  );
}
