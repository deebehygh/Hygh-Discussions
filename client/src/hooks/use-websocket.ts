import { useEffect, useRef, useState, useCallback } from 'react';
import type { WSMessage, Message, User } from '@shared/schema';

interface UseWebSocketProps {
  username: string | null;
  onMessage?: (message: Message) => void;
  onUserJoined?: (username: string) => void;
  onUserLeft?: (username: string) => void;
  onUserList?: (users: User[]) => void;
  onTyping?: (username: string) => void;
  onStopTyping?: (username: string) => void;
  onMessageHistory?: (messages: Message[]) => void;
}

export function useWebSocket({
  username,
  onMessage,
  onUserJoined,
  onUserLeft,
  onUserList,
  onTyping,
  onStopTyping,
  onMessageHistory,
}: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        
        // Join chat if username is available
        if (username) {
          ws.send(JSON.stringify({
            type: 'user_joined',
            username,
            timestamp: new Date().toISOString()
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const wsMessage: WSMessage = JSON.parse(event.data);
          
          switch (wsMessage.type) {
            case 'message':
              onMessage?.(wsMessage.data);
              break;
            case 'message_history':
              onMessageHistory?.(wsMessage.data);
              break;
            case 'user_joined':
              onUserJoined?.(wsMessage.data.username);
              break;
            case 'user_left':
              onUserLeft?.(wsMessage.data.username);
              break;
            case 'user_list':
              onUserList?.(wsMessage.data);
              break;
            case 'typing':
              onTyping?.(wsMessage.data.username);
              break;
            case 'stop_typing':
              onStopTyping?.(wsMessage.data.username);
              break;
            case 'error':
              setConnectionError(wsMessage.data.message);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          setConnectionError('Connection lost. Please refresh the page.');
        }
      };

      ws.onerror = () => {
        setConnectionError('Connection error occurred');
      };

    } catch (error) {
      setConnectionError('Failed to connect to chat server');
    }
  }, [username, onMessage, onUserJoined, onUserLeft, onUserList, onTyping, onStopTyping, onMessageHistory]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && username) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        data: { content },
        username,
        timestamp: new Date().toISOString()
      }));
      return true;
    }
    return false;
  }, [username]);

  const sendTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && username) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        username,
        timestamp: new Date().toISOString()
      }));
    }
  }, [username]);

  const sendStopTyping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && username) {
      wsRef.current.send(JSON.stringify({
        type: 'stop_typing',
        username,
        timestamp: new Date().toISOString()
      }));
    }
  }, [username]);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    sendTyping,
    sendStopTyping,
    reconnect: connect,
  };
}
