import React from 'react';
import Link from 'next/link';
import { MessageSquare, User, LogOut } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutUser, isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  hideNavigation?: boolean;
  user?: { name: string; email: string; username: string } | null;
}

const Header: React.FC<HeaderProps> = ({ hideNavigation = false, user = null }) => {
  const router = useRouter();

  const handleLogout = () => {
    logoutUser();
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  return (
    <header className="bg-gray-900 text-white px-4 lg:px-6 h-14 flex items-center border-b border-gray-700">
      <Link className="flex items-center justify-center" href="/">
        <MessageSquare className="h-6 w-6" />
        <span className="ml-2 text-2xl font-bold">AllChat</span>
      </Link>
      {!hideNavigation && (
        <nav className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#how-it-works">
            How It Works
          </Link>
          {isAuthenticated() && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button 
                variant="outline" 
                className="text-sm text-black border-white hover:bg-white hover:text-gray-900 transition-all duration-200 ease-in-out hover:shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
                Login / Sign Up
              </Button>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;