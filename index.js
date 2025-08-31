// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";
var DATA_DIR = path.join(process.cwd(), "data");
var USERS_FILE = path.join(DATA_DIR, "users.json");
var SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");
var MESSAGES_FILE = path.join(DATA_DIR, "messages.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
[USERS_FILE, SESSIONS_FILE, MESSAGES_FILE].forEach((file) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([]), "utf8");
  }
});
var FileStorage = class {
  readFile(filePath) {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  writeFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  }
  async getUser(id) {
    const users2 = this.readFile(USERS_FILE);
    return users2.find((user) => user.id === id);
  }
  async getUserByUsername(username) {
    const users2 = this.readFile(USERS_FILE);
    return users2.find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const users2 = this.readFile(USERS_FILE);
    const user = {
      ...insertUser,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    };
    users2.push(user);
    this.writeFile(USERS_FILE, users2);
    return user;
  }
  async createChatSession(insertSession) {
    const sessions = this.readFile(SESSIONS_FILE);
    const session = {
      ...insertSession,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    };
    sessions.push(session);
    this.writeFile(SESSIONS_FILE, sessions);
    return session;
  }
  async getChatSessionsByUserId(userId) {
    const sessions = this.readFile(SESSIONS_FILE);
    return sessions.filter((session) => session.userId === userId);
  }
  async createChatMessage(insertMessage) {
    const messages = this.readFile(MESSAGES_FILE);
    const message = {
      ...insertMessage,
      imageData: insertMessage.imageData || null,
      id: randomUUID(),
      createdAt: /* @__PURE__ */ new Date()
    };
    messages.push(message);
    this.writeFile(MESSAGES_FILE, messages);
    return message;
  }
  async getChatMessagesBySessionId(sessionId) {
    const messages = this.readFile(MESSAGES_FILE);
    return messages.filter((message) => message.sessionId === sessionId);
  }
  async getUserStats(userId) {
    const sessions = await this.getChatSessionsByUserId(userId);
    const allMessages = this.readFile(MESSAGES_FILE);
    const userMessages = allMessages.filter(
      (msg) => sessions.some((session) => session.sessionId === msg.sessionId)
    );
    return {
      totalChats: sessions.length,
      totalMessages: userMessages.filter((msg) => msg.role === "user").length,
      imagesAnalyzed: userMessages.filter((msg) => msg.imageData).length
    };
  }
};
var storage = new FileStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  role: text("role").notNull(),
  // 'user' or 'ai'
  content: text("content").notNull(),
  imageData: text("image_data"),
  // base64 encoded image
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  userId: true,
  sessionId: true
});
var insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  role: true,
  content: true,
  imageData: true
});

// server/services/gemini.ts
import { GoogleGenAI } from "@google/genai";
var ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
async function generateText(prompt, systemInstruction) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a helpful AI assistant. Provide accurate, concise, and helpful responses."
      }
    });
    return response.text || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text response");
  }
}
async function analyzeImage(imageData, mimeType, prompt) {
  try {
    const textPrompt = prompt || "Analyze this image in detail and describe its key elements, context, and any notable aspects.";
    const contents = [
      {
        inlineData: {
          data: imageData,
          mimeType
        }
      },
      textPrompt
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents
    });
    return response.text || "I couldn't analyze this image. Please try uploading a different image.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image");
  }
}
async function generateHeadline() {
  try {
    const headlines = [
      "Transform Ideas into Intelligent Insights",
      "Unlock the Power of AI Conversation",
      "Experience Next-Generation AI Analysis",
      "Revolutionize Your Creative Process",
      "Discover AI That Understands You"
    ];
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Write 1 catchy headline for an AI assistant that does text generation and image analysis.",
      config: {
        systemInstruction: "You write ultra-short punchy product headlines for an AI assistant website. Max 8 words. Be creative and engaging."
      }
    });
    const generatedHeadline = response.text?.trim();
    return generatedHeadline || headlines[Math.floor(Math.random() * headlines.length)];
  } catch (error) {
    console.error("Error generating headline:", error);
    const fallbacks = [
      "Transform Ideas into Intelligent Insights",
      "Unlock the Power of AI Conversation",
      "Experience Next-Generation AI Analysis"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// server/routes.ts
import * as crypto from "crypto";
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
async function registerRoutes(app2) {
  app2.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      const hashedPassword = crypto.createHash("sha256").update(validatedData.password).digest("hex");
      const user = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword
      });
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid registration data" });
    }
  });
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
      if (user.password !== hashedPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = crypto.createHash("sha256").update(user.id + Date.now().toString()).digest("hex");
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
  app2.post("/api/chat/session", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json({ success: true, session });
    } catch (error) {
      console.error("Create session error:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });
  app2.get("/api/chat/sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions = await storage.getChatSessionsByUserId(userId);
      res.json({ success: true, sessions });
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });
  app2.post("/api/chat/message", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      res.json({ success: true, message });
    } catch (error) {
      console.error("Create message error:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });
  app2.get("/api/chat/messages/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      res.json({ success: true, messages });
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to get messages" });
    }
  });
  app2.post("/api/ai/text", async (req, res) => {
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
  app2.post("/api/ai/image", upload.single("image"), async (req, res) => {
    try {
      const { prompt } = req.body;
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "Image file is required" });
      }
      const imageData = file.buffer.toString("base64");
      const response = await analyzeImage(imageData, file.mimetype, prompt);
      res.json({ success: true, response, imageData });
    } catch (error) {
      console.error("Image analysis error:", error);
      res.status(500).json({ error: "Failed to analyze image" });
    }
  });
  app2.get("/api/ai/headline", async (req, res) => {
    try {
      const headline = await generateHeadline();
      res.json({ success: true, headline });
    } catch (error) {
      console.error("Headline generation error:", error);
      res.status(500).json({ error: "Failed to generate headline" });
    }
  });
  app2.get("/api/user/stats/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const stats = await storage.getUserStats(userId);
      res.json({ success: true, stats });
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ error: "Failed to get user stats" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
