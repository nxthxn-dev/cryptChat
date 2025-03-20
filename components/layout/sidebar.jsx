import React from 'react';
import { useRouter } from 'next/navigation';
import ChatList from '../chat/chat-list';
import { useAuth } from '../../hooks/use-auth';
import { useChat } from '../../hooks/use-chat';
import ThemeToggle from '../ui/theme-toggle';
import Avatar from '../ui/avatar';
import Button from '../ui/button';

/**
 * Sidebar component displaying user info and chat list
 * @returns {JSX.Element}
 */
const Sidebar = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { chats, loading } = useChat();
  
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <div className="flex flex-col h-full border-r border-foreground/10">
      {/* User profile section */}
      <div className="p-4 border-b border-foreground/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar 
              initials={user?.displayName?.charAt(0) || 'U'}
              size="md"
              status="online"
            />
            <div>
              <h2 className="font-medium truncate">{user?.displayName || 'User'}</h2>
              <p className="text-sm text-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <Button variant="outline" size="sm" fullWidth onClick={handleLogout}>
          Sign Out
        </Button>
      </div>
      
      {/* Chat list section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-medium mb-2">Chats</h3>
          {loading ? (
            <div className="text-center py-4 text-foreground/60">
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-4 text-foreground/60">
              No chats yet. Start a new conversation!
            </div>
          ) : (
            <ChatList chats={chats} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;