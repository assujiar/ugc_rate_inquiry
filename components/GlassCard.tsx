import { ReactNode } from 'react';
import classNames from 'classnames';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className }: GlassCardProps) {
  return <div className={classNames('glass-soft p-4', className)}>{children}</div>;
}