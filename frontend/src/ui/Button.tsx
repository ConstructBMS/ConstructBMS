import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className='rounded bg-slate-900 text-white px-4 py-2 text-sm'
    >
      {children}
    </button>
  );
}
