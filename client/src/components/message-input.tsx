import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  isConnected: boolean;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  isConnected,
  disabled = false
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const maxLength = 500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled || !isConnected) return;

    onSendMessage(trimmedMessage);
    setMessage('');
    
    // Stop typing indicator
    if (isTyping) {
      onStopTyping();
      setIsTyping(false);
    }
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Auto-resize textarea
      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      
      // Handle typing indicator
      if (value.trim() && isConnected) {
        if (!isTyping) {
          onTyping();
          setIsTyping(true);
        }
        
        // Reset typing timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          if (isTyping) {
            onStopTyping();
            setIsTyping(false);
          }
        }, 2000);
      } else if (isTyping) {
        onStopTyping();
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const canSend = message.trim().length > 0 && isConnected && !disabled;

  return (
    <div className="bg-background border-t border-border px-4 py-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[44px] max-h-[120px] resize-none pr-16"
            disabled={disabled || !isConnected}
            rows={1}
          />
          <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
            {message.length}/{maxLength}
          </div>
        </div>
        
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          className="h-11 w-11 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
      
      <div className="mt-2 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
}
