import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { LogOut, User as LucideUser } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/contexts/StoreContext';

interface User {
  // Add properties of the User type here
}

interface HeaderProps {
  hideNavigation?: boolean;
  user?: User;
}

const Header: React.FC<HeaderProps> = observer(({ hideNavigation = false, user }) => {
  const router = useRouter();
  const store = useStore();
  const { currentUser, logout } = store.userStore;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-primary">AllChat</span>
          </Link>
        </div>

        {!hideNavigation && (
          <nav className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/profile')}>
                  <LucideUser className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Link href="/auth">
                <Button variant="default">Sign In</Button>
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
});

export default Header;