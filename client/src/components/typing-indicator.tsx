interface TypingIndicatorProps {
  typingUsers: string[];
  currentUsername: string;
}

export function TypingIndicator({ typingUsers, currentUsername }: TypingIndicatorProps) {
  const otherTypingUsers = typingUsers.filter(user => user !== currentUsername);
  
  if (otherTypingUsers.length === 0) {
    return null;
  }

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getDisplayText = () => {
    if (otherTypingUsers.length === 1) {
      return `${otherTypingUsers[0]} is typing...`;
    } else if (otherTypingUsers.length === 2) {
      return `${otherTypingUsers[0]} and ${otherTypingUsers[1]} are typing...`;
    } else {
      return `${otherTypingUsers.length} people are typing...`;
    }
  };

  return (
    <div className="flex items-start space-x-3 opacity-75">
      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-medium text-muted-foreground">
          {getInitials(otherTypingUsers[0])}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm text-muted-foreground">
            {getDisplayText()}
          </span>
        </div>
        <div className="bg-muted rounded-lg rounded-tl-none px-4 py-3 max-w-xs">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
