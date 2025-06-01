import { useState, useCallback } from 'react';
import { MessageList } from '@/components/message-list';
import { MessageInput } from '@/components/message-input';
import { UsernameModal } from '@/components/username-modal';
import { useWebSocket } from '@/hooks/use-websocket';
import { useToast } from '@/hooks/use-toast';
import type { Message, User } from '@shared/schema';
import { MessageCircle, Users } from 'lucide-react';

export default function Chat() {
  const [username, setUsername] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { toast } = useToast();

  const handleMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleMessageHistory = useCallback((historyMessages: Message[]) => {
    setMessages(historyMessages);
  }, []);

  const handleUserJoined = useCallback((joinedUsername: string) => {
    toast({
      description: `${joinedUsername} joined the chat`,
      duration: 3000,
    });
  }, [toast]);

  const handleUserLeft = useCallback((leftUsername: string) => {
    toast({
      description: `${leftUsername} left the chat`,
      duration: 3000,
    });
    
    // Remove from typing users if they were typing
    setTypingUsers(prev => prev.filter(user => user !== leftUsername));
  }, [toast]);

  const handleUserList = useCallback((users: User[]) => {
    setOnlineUsers(users);
  }, []);

  const handleTyping = useCallback((typingUsername: string) => {
    setTypingUsers(prev => {
      if (!prev.includes(typingUsername)) {
        return [...prev, typingUsername];
      }
      return prev;
    });
  }, []);

  const handleStopTyping = useCallback((stoppedTypingUsername: string) => {
    setTypingUsers(prev => prev.filter(user => user !== stoppedTypingUsername));
  }, []);

  const {
    isConnected,
    connectionError,
    sendMessage,
    sendTyping,
    sendStopTyping
  } = useWebSocket({
    username,
    onMessage: handleMessage,
    onMessageHistory: handleMessageHistory,
    onUserJoined: handleUserJoined,
    onUserLeft: handleUserLeft,
    onUserList: handleUserList,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
  });

  const handleSendMessage = useCallback((content: string) => {
    const success = sendMessage(content);
    if (!success) {
      toast({
        title: 'Failed to send message',
        description: 'Please check your connection and try again.',
        variant: 'destructive',
      });
    }
  }, [sendMessage, toast]);

  const handleUsernameSubmit = useCallback((submittedUsername: string) => {
    setUsername(submittedUsername);
  }, []);

  if (connectionError) {
    toast({
      title: 'Connection Error',
      description: connectionError,
      variant: 'destructive',
      duration: 5000,
    });
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background shadow-lg">
      <UsernameModal
        isOpen={!username}
        onUsernameSubmit={handleUsernameSubmit}
      />
      
      {/* Header */}
      <header className="bg-background border-b border-border px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">ChatApp</h1>
              <p className="text-sm text-muted-foreground">
                {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {username && (
              <>
                <span className="hidden sm:inline text-sm text-foreground font-medium">
                  {username}
                </span>
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-foreground">
                    {username.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUsername={username || ''}
        typingUsers={typingUsers}
      />

      {/* Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTyping={sendTyping}
        onStopTyping={sendStopTyping}
        isConnected={isConnected}
        disabled={!username}
      />
    </div>
  );
}
