import React from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

interface HeaderProps {
  hideNavigation?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideNavigation = false }) => (
  <header className="bg-gray-900 text-white px-4 lg:px-6 h-14 flex items-center border-b border-gray-700">
    <Link className="flex items-center justify-center" href="/">
      <MessageSquare className="h-6 w-6" />
      <span className="ml-2 text-2xl font-bold">AllChat</span>
    </Link>
    {!hideNavigation && (
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
          Features
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
          How It Works
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="#about">
          About
        </Link>
      </nav>
    )}
  </header>
);

export default Header;