import type { HTMLAttributes, PropsWithChildren } from 'react';

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className='rounded border bg-white p-4 shadow-sm cursor-pointer'
    >
      {children}
    </div>
  );
}
