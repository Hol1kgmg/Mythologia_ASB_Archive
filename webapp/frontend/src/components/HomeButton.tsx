import React from 'react';
import Link from 'next/link';

interface HomeButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function HomeButton({ 
  className = '', 
  children = '← ホームに戻る' 
}: HomeButtonProps) {
  return (
    <Link 
      href="/" 
      className={`inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300 ${className}`}
      aria-label="ホームページに戻る"
    >
      {children}
    </Link>
  );
}