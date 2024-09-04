import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer className="text-white flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-gray-700">
    <p className="text-xs text-gray-400">© 2024 AllChat. All rights reserved.</p>
    <nav className="sm:ml-auto flex gap-4 sm:gap-6">
      <Link className="text-xs hover:underline underline-offset-4" href="#">
        Terms of Service
      </Link>
      <Link className="text-xs hover:underline underline-offset-4" href="#">
        Privacy
      </Link>
    </nav>
  </footer>
);

export default Footer;