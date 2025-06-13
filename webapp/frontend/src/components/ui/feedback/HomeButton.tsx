import React from 'react';
import Link from 'next/link';
import { Button } from '..';

interface HomeButtonProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export default function HomeButton({ 
  className = '', 
  children = '← ホームに戻る',
  variant = 'primary',
  size = 'md'
}: HomeButtonProps) {
  return (
    <Link href="/" aria-label="ホームページに戻る">
      <Button 
        variant={variant}
        size={size}
        className={className}
      >
        {children}
      </Button>
    </Link>
  );
}