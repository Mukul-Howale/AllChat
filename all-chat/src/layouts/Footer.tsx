import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => (
  <footer className="bg-gray-900 text-gray-300 py-6 px-4 md:px-6 border-t border-gray-700">
    <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
      <p className="text-sm mb-4 sm:mb-0">© 2024 AllChat. All rights reserved.</p>
      <nav className="flex gap-4 sm:gap-6">
        <Link className="text-sm hover:text-white hover:underline underline-offset-4" href="#">
          Terms of Service
        </Link>
        <Link className="text-sm hover:text-white hover:underline underline-offset-4" href="#">
          Privacy Policy
        </Link>
      </nav>
    </div>
  </footer>
);

export default Footer;