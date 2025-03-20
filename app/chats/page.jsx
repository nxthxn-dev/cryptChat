'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { listenToUserChats } from '@/lib/firebase/firestore';
import Header from '@/components/layout/header';
import ChatList from '@/components/chat/chat-list';
import NewChatButton from '@/components/layout/new-chat-button';

export default function Chats() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/sign-in');
      return;
    }

    if (user) {
      const unsubscribe = listenToUserChats(user.email, (updatedChats) => {
        // Sort chats by lastMessageTime (newest first)
        const sortedChats = [...updatedChats].sort((a, b) => {
          if (!a.lastMessageTime) return 1;
          if (!b.lastMessageTime) return -1;
          return b.lastMessageTime.seconds - a.lastMessageTime.seconds;
        });
        
        setChats(sortedChats);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, loading, router]);

  if (loading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-pulse text-lg">Loading chats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
        
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              You don't have any conversations yet.
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              Start a new chat using the button below.
            </p>
          </div>
        ) : (
          <ChatList chats={chats} currentUserEmail={user.email} />
        )}
      </main>
      
      <NewChatButton />
    </div>
  );
}