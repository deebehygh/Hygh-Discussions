import { useEffect, useRef } from 'react';
import type { Message } from '@shared/schema';
import { TypingIndicator } from './typing-indicator';
import { format } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
  typingUsers: string[];
}

export function MessageList({ messages, currentUsername, typingUsers }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (username: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-yellow-500'
    ];
    
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return format(date, 'h:mm a');
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-muted/30">
      {messages.map((message) => {
        const isOwnMessage = message.username === currentUsername;
        
        return (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${isOwnMessage ? 'justify-end' : ''}`}
          >
            {!isOwnMessage && (
              <div className={`w-8 h-8 ${getAvatarColor(message.username)} rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className="text-xs font-medium text-white">
                  {getInitials(message.username)}
                </span>
              </div>
            )}
            
            <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
              <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : ''}`}>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(message.timestamp)}
                </span>
                <span className="text-sm font-medium">
                  {isOwnMessage ? 'You' : message.username}
                </span>
              </div>
              
              <div
                className={`rounded-lg px-4 py-3 max-w-xs sm:max-w-md inline-block ${
                  isOwnMessage
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-background border border-border rounded-tl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
            
            {isOwnMessage && (
              <div className={`w-8 h-8 ${getAvatarColor(currentUsername)} rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className="text-xs font-medium text-white">
                  {getInitials(currentUsername)}
                </span>
              </div>
            )}
          </div>
        );
      })}
      
      <TypingIndicator typingUsers={typingUsers} currentUsername={currentUsername} />
      
      <div ref={messagesEndRef} />
    </div>
  );
}
