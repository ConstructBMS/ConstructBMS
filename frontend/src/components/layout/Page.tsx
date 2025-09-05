import React from 'react';
import type { PageProps } from '../../lib/types/core';
import { ChevronRight } from 'lucide-react';

export function Page({ title, breadcrumbs, children }: PageProps) {
  return (
    <div className='flex-1 space-y-6 p-6'>
      {/* Header */}
      <div className='space-y-2'>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className='flex items-center space-x-1 text-sm text-muted-foreground'>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className='h-4 w-4' />}
                {item.href ? (
                  <a
                    href={item.href}
                    className='hover:text-foreground transition-colors'
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className='text-foreground'>{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>
          {title}
        </h1>
      </div>

      {/* Content */}
      <div className='space-y-6'>{children}</div>
    </div>
  );
}
