import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Users, MessageSquare, Bell, ThumbsUp, ThumbsDown } from 'lucide-react';
import Header from '../layouts/Header';
import Footer from '../layouts/Footer';
import { observer } from 'mobx-react-lite';
import { useStore } from '@/contexts/StoreContext';

const UserProfile = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser, logout } = store.userStore;

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [friendsCount, setFriendsCount] = useState(currentUser?.friendsCount || 0);
  const [messages, setMessages] = useState(currentUser?.messages || 0);
  const [notifications, setNotifications] = useState(currentUser?.notifications || 0);
  const [thumbsUp, setThumbsUp] = useState(currentUser?.thumbsUp || 0);
  const [thumbsDown, setThumbsDown] = useState(currentUser?.thumbsDown || 0);
  const [isPaidUser, setIsPaidUser] = useState(currentUser?.isPaidUser || false);
  const [isEmailVerified, setIsEmailVerified] = useState(currentUser?.isEmailVerified || false);

  useEffect(() => {
    if (!currentUser) {
      router.push('/auth');
    }
  }, [currentUser, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulated profile update logic
      store.userStore.updateProfile({
        name,
        email,
        username,
        phoneNumber,
        friendsCount,
        messages,
        notifications,
        thumbsUp,
        thumbsDown,
        isPaidUser,
        isEmailVerified
      });
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen bg-theme-background text-theme-foreground">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-theme-surface rounded-lg p-6 shadow-md elevation-1">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <img
                    alt="User avatar"
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${currentUser.name}`}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-theme-foreground">{currentUser.name}</h1>
                  <p className="text-theme-foreground/60">{currentUser.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-theme-foreground mb-4">Profile Settings</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-theme-foreground/90">Display Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-theme-surface border-theme-border focus:border-theme-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-theme-foreground/90">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-theme-surface border-theme-border focus:border-theme-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-theme-foreground/90">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-theme-surface border-theme-border focus:border-theme-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-theme-foreground/90">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        className="bg-theme-surface border-theme-border focus:border-theme-primary"
                      />
                    </div>

                    <div className="flex items-center space-x-2 text-theme-muted">
                      <Users size={20} />
                      <span>{friendsCount} friends</span>
                    </div>
                    <div className="flex items-center space-x-2 text-theme-muted">
                      <MessageSquare size={20} />
                      <span>{messages} messages</span>
                    </div>
                    <div className="flex items-center space-x-2 text-theme-muted">
                      <Bell size={20} />
                      <span>{notifications} notifications</span>
                    </div>
                    <div className="flex items-center space-x-4 text-theme-muted">
                      <div className="flex items-center space-x-2">
                        <ThumbsUp size={20} />
                        <span>{thumbsUp}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ThumbsDown size={20} />
                        <span>{thumbsDown}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit"
                        className="bg-theme-primary text-theme-surface hover:bg-theme-primary-600 transition-colors elevation-1"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-theme-foreground mb-4">Account Settings</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-theme-surface-100 rounded-md">
                      <div>
                        <h3 className="font-medium text-theme-foreground">Delete Account</h3>
                        <p className="text-sm text-theme-foreground/60">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button 
                        variant="destructive"
                        onClick={handleLogout}
                        className="bg-error-500 text-theme-surface hover:bg-error-600 transition-colors elevation-1"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
});

export default UserProfile;
