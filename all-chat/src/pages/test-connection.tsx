import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import dynamic from 'next/dynamic';
import { useStore } from '@/contexts/StoreContext';
import { useRouter } from 'next/router';

// Dynamically import ConnectionTester with no SSR
const ConnectionTester = dynamic(
  () => import('@/components/ConnectionTester'),
  { ssr: false }
);

const TestConnection: React.FC = observer(() => {
  const { userStore } = useStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!userStore.currentUser) {
      router.push('/auth');
    }
  }, [userStore.currentUser, router]);

  if (!isMounted || !userStore.currentUser) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <h1 className="text-2xl font-bold mb-6">Connection Test Page</h1>
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current User</h2>
          <pre className="text-sm">
            {JSON.stringify(userStore.currentUser, null, 2)}
          </pre>
        </div>
        <ConnectionTester />
      </div>
    </div>
  );
});

export default TestConnection;
