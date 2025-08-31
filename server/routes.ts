import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { generateText, analyzeImage, generateHeadline } from "./services/gemini";
import * as crypto from "crypto";
import multer from "multer";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = crypto.createHash('sha256').update(validatedData.password).digest('hex');
      
      const user = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword,
      });

      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      if (user.password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create session token (simple hash for demo)
      const token = crypto.createHash('sha256').update(user.id + Date.now().toString()).digest('hex');

      res.json({ 
        success: true, 
        user: { id: user.id, username: user.username },
        token 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Chat routes
  app.post("/api/chat/session", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json({ success: true, session });
    } catch (error) {
      console.error("Create session error:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get("/api/chat/sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions = await storage.getChatSessionsByUserId(userId);
      res.json({ success: true, sessions });
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  app.post("/api/chat/message", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      res.json({ success: true, message });
    } catch (error) {
      console.error("Create message error:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  app.get("/api/chat/messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      res.json({ success: true, messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // Gemini AI routes
  app.post("/api/ai/text", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await generateText(prompt, systemInstruction);
      res.json({ success: true, response });
    } catch (error) {
      console.error("Text generation error:", error);
      res.status(500).json({ error: "Failed to generate text" });
    }
  });

  app.post("/api/ai/image", upload.single('image'), async (req, res) => {
    try {
      const { prompt } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const imageData = file.buffer.toString('base64');
      const response = await analyzeImage(imageData, file.mimetype, prompt);
      
      res.json({ success: true, response, imageData });
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });

  app.get("/api/ai/headline", async (req, res) => {
    try {
      const headline = await generateHeadline();
      res.json({ success: true, headline });
    } catch (error) {
      console.error("Headline generation error:", error);
      res.status(500).json({ error: "Failed to generate headline" });
    }
  });

  // User stats route
  app.get("/api/user/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserStats(userId);
      res.json({ success: true, stats });
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ error: "Failed to get user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
