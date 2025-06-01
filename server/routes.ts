import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema, type WSMessage } from "@shared/schema";
import { z } from "zod";

interface ExtendedWebSocket extends WebSocket {
  username?: string;
  isAlive?: boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create WebSocket server on distinct path
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  // Store active connections
  const clients = new Set<ExtendedWebSocket>();

  // Broadcast message to all connected clients
  function broadcast(message: WSMessage, excludeClient?: ExtendedWebSocket) {
    const messageStr = JSON.stringify(message);
    clients.forEach(client => {
      if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  // WebSocket connection handling
  wss.on('connection', async (ws: ExtendedWebSocket) => {
    clients.add(ws);
    ws.isAlive = true;

    // Send recent messages to new client
    try {
      const recentMessages = await storage.getRecentMessages(20);
      ws.send(JSON.stringify({
        type: 'message_history',
        data: recentMessages
      }));
    } catch (error) {
      console.error('Error sending message history:', error);
    }

    // Handle incoming WebSocket messages
    ws.on('message', async (data) => {
      try {
        const wsMessage: WSMessage = JSON.parse(data.toString());
        
        switch (wsMessage.type) {
          case 'user_joined':
            if (wsMessage.username) {
              ws.username = wsMessage.username;
              
              // Check if user exists, create if not
              let user = await storage.getUserByUsername(wsMessage.username);
              if (!user) {
                user = await storage.createUser({ username: wsMessage.username });
              } else {
                await storage.setUserOnline(wsMessage.username, true);
              }

              // Broadcast user joined
              broadcast({
                type: 'user_joined',
                data: { username: wsMessage.username },
                timestamp: new Date().toISOString()
              }, ws);

              // Send updated user list
              const onlineUsers = await storage.getOnlineUsers();
              broadcast({
                type: 'user_list',
                data: onlineUsers
              });
            }
            break;

          case 'message':
            if (ws.username && wsMessage.data?.content) {
              try {
                // Validate message
                const validatedMessage = insertMessageSchema.parse({
                  content: wsMessage.data.content,
                  username: ws.username
                });

                // Store message
                const savedMessage = await storage.createMessage(validatedMessage);

                // Broadcast to all clients
                broadcast({
                  type: 'message',
                  data: savedMessage,
                  timestamp: savedMessage.timestamp.toISOString()
                });
              } catch (validationError) {
                ws.send(JSON.stringify({
                  type: 'error',
                  data: { message: 'Invalid message format' }
                }));
              }
            }
            break;

          case 'typing':
            if (ws.username) {
              broadcast({
                type: 'typing',
                data: { username: ws.username }
              }, ws);
            }
            break;

          case 'stop_typing':
            if (ws.username) {
              broadcast({
                type: 'stop_typing',
                data: { username: ws.username }
              }, ws);
            }
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          data: { message: 'Error processing message' }
        }));
      }
    });

    // Handle connection close
    ws.on('close', async () => {
      clients.delete(ws);
      
      if (ws.username) {
        await storage.setUserOnline(ws.username, false);
        
        broadcast({
          type: 'user_left',
          data: { username: ws.username },
          timestamp: new Date().toISOString()
        });

        // Send updated user list
        const onlineUsers = await storage.getOnlineUsers();
        broadcast({
          type: 'user_list',
          data: onlineUsers
        });
      }
    });

    // Handle pong
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });

  // Ping clients every 30 seconds to keep connections alive
  const interval = setInterval(() => {
    clients.forEach((ws) => {
      if (ws.isAlive === false) {
        clients.delete(ws);
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  // REST API endpoints
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getRecentMessages(50);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid user data', details: error.errors });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  });

  app.get('/api/users/online', async (req, res) => {
    try {
      const onlineUsers = await storage.getOnlineUsers();
      res.json(onlineUsers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch online users' });
    }
  });

  return httpServer;
}
