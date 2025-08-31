import { type User, type InsertUser, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
[USERS_FILE, SESSIONS_FILE, MESSAGES_FILE].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([]), 'utf8');
  }
});

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessionsByUserId(userId: string): Promise<ChatSession[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]>;
  getUserStats(userId: string): Promise<{
    totalChats: number;
    totalMessages: number;
    imagesAnalyzed: number;
  }>;
}

export class FileStorage implements IStorage {
  private readFile<T>(filePath: string): T[] {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private writeFile<T>(filePath: string, data: T[]): void {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getUser(id: string): Promise<User | undefined> {
    const users = this.readFile<User>(USERS_FILE);
    return users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = this.readFile<User>(USERS_FILE);
    return users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = this.readFile<User>(USERS_FILE);
    const user: User = {
      ...insertUser,
      id: randomUUID(),
      createdAt: new Date(),
    };
    users.push(user);
    this.writeFile(USERS_FILE, users);
    return user;
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const sessions = this.readFile<ChatSession>(SESSIONS_FILE);
    const session: ChatSession = {
      ...insertSession,
      id: randomUUID(),
      createdAt: new Date(),
    };
    sessions.push(session);
    this.writeFile(SESSIONS_FILE, sessions);
    return session;
  }

  async getChatSessionsByUserId(userId: string): Promise<ChatSession[]> {
    const sessions = this.readFile<ChatSession>(SESSIONS_FILE);
    return sessions.filter(session => session.userId === userId);
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const messages = this.readFile<ChatMessage>(MESSAGES_FILE);
    const message: ChatMessage = {
      ...insertMessage,
      imageData: insertMessage.imageData || null,
      id: randomUUID(),
      createdAt: new Date(),
    };
    messages.push(message);
    this.writeFile(MESSAGES_FILE, messages);
    return message;
  }

  async getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    const messages = this.readFile<ChatMessage>(MESSAGES_FILE);
    return messages.filter(message => message.sessionId === sessionId);
  }

  async getUserStats(userId: string): Promise<{
    totalChats: number;
    totalMessages: number;
    imagesAnalyzed: number;
  }> {
    const sessions = await this.getChatSessionsByUserId(userId);
    const allMessages = this.readFile<ChatMessage>(MESSAGES_FILE);
    const userMessages = allMessages.filter(msg => 
      sessions.some(session => session.sessionId === msg.sessionId)
    );
    
    return {
      totalChats: sessions.length,
      totalMessages: userMessages.filter(msg => msg.role === 'user').length,
      imagesAnalyzed: userMessages.filter(msg => msg.imageData).length,
    };
  }
}

export const storage = new FileStorage();
