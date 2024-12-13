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
import styles from '@/styles/profile.module.css';

const UserProfile = observer(() => {
  const router = useRouter();
  const store = useStore();
  const { currentUser, logout } = store.userStore;
  const [isClient, setIsClient] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [friendsCount, setFriendsCount] = useState(0);
  const [messages, setMessages] = useState(0);
  const [notifications, setNotifications] = useState(0);
  const [thumbsUp, setThumbsUp] = useState(0);
  const [thumbsDown, setThumbsDown] = useState(0);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!currentUser) {
      router.push('/auth');
      return;
    }
    
    // Initialize state with currentUser data
    setName(currentUser.name || '');
    setEmail(currentUser.email || '');
    setUsername(currentUser.username || '');
    setPhoneNumber(currentUser.phoneNumber || '');
    setFriendsCount(currentUser.friendsCount || 0);
    setMessages(currentUser.messages || 0);
    setNotifications(currentUser.notifications || 0);
    setThumbsUp(currentUser.thumbsUp || 0);
    setThumbsDown(currentUser.thumbsDown || 0);
    setIsPaidUser(currentUser.isPaidUser || false);
    setIsEmailVerified(currentUser.isEmailVerified || false);
  }, [currentUser, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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

  if (!isClient || !currentUser) return null;

  return (
    <div className="flex flex-col min-h-screen bg-theme-background text-theme-foreground">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-theme-surface rounded-xl p-6 shadow-md elevation-1">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20 rounded-full">
                  <img
                    alt="User avatar"
                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${name}`}
                    style={{ width: '100%', height: '100%' }}
                  />
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-theme-foreground">{name}</h1>
                  <p className="text-theme-foreground/60">{email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-theme-foreground mb-4">Profile Settings</h2>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="space-y-2 rounded-lg">
                      <Label htmlFor="name" className="text-theme-foreground/90">Display Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className="space-y-2 rounded-lg">
                      <Label htmlFor="email" className="text-theme-foreground/90">Email</Label>
                      <Input
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className="space-y-2 rounded-lg">
                      <Label htmlFor="username" className="text-theme-foreground/90">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.input}
                      />
                    </div>

                    <div className="space-y-2 rounded-lg">
                      <Label htmlFor="phone" className="text-theme-foreground/90">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter your phone number"
                        className={styles.input}
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

                    <div className="pt-4 space-y-4">
                      <Button 
                        type="submit"
                        className={`bg-theme-primary text-theme-surface hover:bg-theme-primary-600 transition-colors elevation-1 ${styles.button}`}
                      >
                        Save Changes
                      </Button>
                      
                      <div className="flex">
                        <Button 
                          onClick={handleLogout}
                          variant="outline"
                          className={`text-theme-foreground hover:bg-theme-surface-100 transition-colors ${styles.button}`}
                        >
                          Logout
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-theme-foreground mb-4">Account Settings</h2>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 ${styles.dangerBox}`}>
                      <div>
                        <h3 className="font-medium text-red-700 dark:text-red-400">Delete Account</h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button 
                        variant="destructive"
                        className={`bg-red-600 hover:bg-red-700 text-white transition-colors ${styles.button}`}
                      >
                        Delete Account
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
