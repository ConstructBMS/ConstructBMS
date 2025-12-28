import { Button } from './Button';
import { useAuth } from '../app/authShim';

export function TopBar() {
  const { signOut } = useAuth();

  return (
    <div className='border-b bg-white p-3 flex justify-between'>
      <div className='font-semibold'>ConstructOS Estimating</div>
      <Button variant='secondary' onClick={signOut}>
        Sign out
      </Button>
    </div>
  );
}
