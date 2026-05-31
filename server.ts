import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for chat streaming with Google Gemini
  app.post("/api/chat", async (req: express.Request, res: express.Response) => {
    try {
      const { messages, modelId } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages format" });
      }

      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Map mock Claude models to high-performance real Gemini alternatives
      let targetModel = "gemini-3.5-flash"; 
      let systemInstruction = "You are Claude, a helpful, friendly, and honest AI assistant. Always format your responses in elegant Markdown.";

      if (modelId === 'claude-3-5-sonnet') {
        targetModel = "gemini-3.5-flash";
        systemInstruction = "You are Claude 3.5 Sonnet, a highly advanced assistant. Your tone is elegant, helpful, and highly analytical. Format responses beautifully with generous markdown, bold key phrases, lists, and syntax-highlighted code blocks where helpful.";
      } else if (modelId === 'claude-3-opus') {
        targetModel = "gemini-3.5-flash";
        systemInstruction = "You are Claude 3 Opus, the deepest reasoning assistant. Provide profound, comprehensive, and exhaustive analytical answers. Format everything elegantly in well-spaced Markdown.";
      } else if (modelId === 'claude-3-haiku') {
        targetModel = "gemini-3.5-flash";
        systemInstruction = "You are Claude 3 Haiku, a lightweight, highly responsive companion. Keep responses quick, concise, upbeat, and very practical.";
      }

      // Format messages into Gemini format
      const contents = messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      // Setup Server-Sent Events headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Call Gemini streaming API
      const responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || "";
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }

      res.write("data: [DONE]\n\n");
      res.end();

    } catch (err: any) {
      console.error("Gemini Error:", err);
      // Fallback response inside stream
      try {
        res.write(`data: ${JSON.stringify({ error: err.message || "An API error occurred" })}\n\n`);
        res.end();
      } catch (e) {
        // Stream might be closed
      }
    }
  });

  // Health and config endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
