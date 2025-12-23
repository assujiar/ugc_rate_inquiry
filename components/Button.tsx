import { ReactNode } from 'react';
import classNames from 'classnames';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  children: ReactNode;
}

export default function Button({ variant = 'primary', children, className, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-highlight disabled:opacity-40 disabled:pointer-events-none';
  const variants: Record<string, string> = {
    primary:
      'bg-primary text-white hover:bg-accent active:bg-primary-2',
    secondary:
      'bg-white/60 backdrop-blur-sm border border-border text-text hover:bg-white/70 active:bg-white/80',
    ghost:
      'bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20',
    destructive:
      'bg-danger text-white hover:bg-primary active:bg-primary-2',
  };
  return (
    <button
      className={classNames(base, variants[variant], className, 'px-4 h-10')}
      {...props}
    >
      {children}
    </button>
  );
}