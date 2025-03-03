import React from 'react';
import type { MessageReaction } from '../../types';

interface MessageReactionsProps {
  reactions: MessageReaction[];
  onReact: (emoji: string) => void;
  isCurrentUser: boolean;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onReact,
  isCurrentUser,
}) => {
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReact(reaction.emoji)}
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isCurrentUser
              ? 'bg-white/10 hover:bg-white/20'
              : 'bg-gray-100 hover:bg-gray-200'
          } transition-colors`}
        >
          <span>{reaction.emoji}</span>
          <span className="ml-1">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
};

export default MessageReactions;