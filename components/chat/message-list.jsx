'use client';

import { formatRelative } from 'date-fns';

export default function MessageList({ messages, currentUserEmail }) {
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach((message) => {
      if (!message.timestamp) return;
      
      const date = new Date(message.timestamp.seconds * 1000);
      const dateString = date.toDateString();
      
      if (!groups[dateString]) {
        groups[dateString] = [];
      }
      
      groups[dateString].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          No messages yet. Start a conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(messageGroups).map(([date, groupMessages]) => (
        <div key={date} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 text-xs text-gray-500 bg-white dark:bg-gray-900 dark:text-gray-400">
                {formatRelative(new Date(date), new Date())}
              </span>
            </div>
          </div>
          
          {groupMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === currentUserEmail ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  message.sender === currentUserEmail
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
                }`}
              >
                <div className="break-words">
                  {message.decryptionFailed ? (
                    <p className="italic text-red-200 dark:text-red-300">
                      [Couldn't decrypt message]
                    </p>
                  ) : (
                    message.text
                  )}
                </div>
                <div className="text-right mt-1">
                  <span
                    className={`text-xs ${
                      message.sender === currentUserEmail
                        ? 'text-blue-100'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {message.timestamp
                      ? new Date(message.timestamp.seconds * 1000).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}