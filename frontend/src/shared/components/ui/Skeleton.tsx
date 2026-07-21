import type { HTMLAttributes } from 'react';
import { cn } from '../../../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200 dark:bg-[#1F1F1F] transition-colors',
        className
      )}
      {...props}
    />
  );
}
