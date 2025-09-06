import {
  Bell,
  ChevronDown,
  Monitor,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react';
import React, { useState } from 'react';
import { useThemeStore } from '../../app/store/ui/theme.store';
import { Button, Input } from '../ui';

export function Topbar() {
  const { theme, toggleTheme } = useThemeStore();
  const [searchFocused, setSearchFocused] = useState(false);

  React.useEffect(() => {
    const handleKeyDownEvent = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDownEvent);
    return () => document.removeEventListener('keydown', handleKeyDownEvent);
  }, []);

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className='h-4 w-4' />;
      case 'dark':
        return <Moon className='h-4 w-4' />;
      case 'system':
        return <Monitor className='h-4 w-4' />;
      default:
        return <Monitor className='h-4 w-4' />;
    }
  };

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-16 items-center justify-between px-6'>
        {/* Left side - Search */}
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Search... (⌘K)'
              className='w-80 pl-10'
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {!searchFocused && (
              <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100'>
                  <span className='text-xs'>⌘</span>K
                </kbd>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className='flex items-center space-x-4'>
          {/* Organization Switcher */}
          <div className='flex items-center space-x-2'>
            <div className='h-8 w-8 rounded-full bg-primary flex items-center justify-center'>
              <span className='text-sm font-medium text-primary-foreground'>
                C
              </span>
            </div>
            <div className='hidden sm:block'>
              <div className='text-sm font-medium'>ConstructBMS</div>
              <div className='text-xs text-muted-foreground'>Organization</div>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </div>

          {/* Notifications */}
          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='h-5 w-5' />
            <span className='absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center'>
              3
            </span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            title={`Current theme: ${theme}`}
          >
            {getThemeIcon()}
          </Button>

          {/* User Menu */}
          <div className='flex items-center space-x-2'>
            <div className='h-8 w-8 rounded-full bg-muted flex items-center justify-center'>
              <User className='h-4 w-4' />
            </div>
            <div className='hidden sm:block'>
              <div className='text-sm font-medium'>Admin User</div>
              <div className='text-xs text-muted-foreground'>
                admin@constructbms.com
              </div>
            </div>
            <Button variant='ghost' size='icon' className='h-8 w-8'>
              <ChevronDown className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
