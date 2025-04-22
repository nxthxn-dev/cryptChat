import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/use-auth";
import Avatar from "../ui/avatar";
import { getRelativeTime } from "../../lib/utils/date";

/**
 * Individual chat item component
 * @param {Object} chat - Chat data
 * @param {boolean} isActive - Whether this chat is currently active
 * @returns {JSX.Element}
 */
const ChatItem = ({ chat, isActive }) => {
  const router = useRouter();
  const { user } = useAuth();

  const otherParticipant = chat.participantsData?.[0] || {};

  const lastMessageTime = chat.lastMessage?.timestamp?.toDate
    ? getRelativeTime(chat.lastMessage.timestamp.toDate())
    : "";

  const lastMessagePreview = chat.lastMessage?.content || "No messages yet";

  const isLastMessageFromUser = chat.lastMessage?.senderId === user?.uid;

  const handleClick = () => {
    router.push(`/chats/${chat.id}`);
  };

  return (
    <div
      className={`
        flex items-center p-3 rounded-md cursor-pointer transition-colors
        ${isActive ? "bg-foreground/10" : "hover:bg-foreground/5"}
      `}
      onClick={handleClick}
    >
      <Avatar
        initials={otherParticipant.displayName?.charAt(0) || "U"}
        src={otherParticipant.photoURL}
        alt={otherParticipant.displayName}
        status={otherParticipant.status || "offline"}
        size="md"
      />

      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h4 className="font-medium truncate">
            {otherParticipant.displayName ||
              otherParticipant.email ||
              "Unknown User"}
          </h4>
          {lastMessageTime && (
            <span className="text-xs text-foreground/60">
              {lastMessageTime}
            </span>
          )}
        </div>

        <p className="text-sm text-foreground/60 truncate">
          {isLastMessageFromUser && "You: "}
          {lastMessagePreview}
        </p>
      </div>
    </div>
  );
};

export default ChatItem;
