import { users, messages, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  setUserOnline(username: string, isOnline: boolean): Promise<void>;
  getOnlineUsers(): Promise<User[]>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getRecentMessages(limit?: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Message[];
  private userIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.messages = [];
    this.userIdCounter = 1;
    this.messageIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      isOnline: "true" 
    };
    this.users.set(id, user);
    return user;
  }

  async setUserOnline(username: string, isOnline: boolean): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      user.isOnline = isOnline ? "true" : "false";
      this.users.set(user.id, user);
    }
  }

  async getOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.isOnline === "true");
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  async getRecentMessages(limit: number = 50): Promise<Message[]> {
    return this.messages.slice(-limit);
  }
}

export const storage = new MemStorage();
