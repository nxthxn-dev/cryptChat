'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export default function ChatList({ chats, currentUserEmail }) {
  const router = useRouter();

  const handleChatClick = (chatId) => {
    router.push(`/chats/${chatId}`);
  };

  return (
    <div className="space-y-2">
      {chats.map((chat) => {
        // Find the other participant's email
        const otherParticipant = chat.participants.find(
          (email) => email !== currentUserEmail
        );
        
        // Format the timestamp
        const timeAgo = chat.lastMessageTime ? 
          formatDistanceToNow(new Date(chat.lastMessageTime.seconds * 1000), { addSuffix: true }) : 
          'No messages yet';
        
        return (
          <div
            key={chat.id}
            className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleChatClick(chat.id)}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                {otherParticipant.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="ml-4 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium truncate dark:text-white">
                  {otherParticipant.split('@')[0]}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo}
                </span>
              </div>
              
              {chat.lastMessage && (
                <div className="flex">
                  {chat.lastMessageSender === currentUserEmail && (
                    <span className="text-gray-500 dark:text-gray-400 mr-1">You: </span>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}