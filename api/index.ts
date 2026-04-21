import "dotenv/config";
import express from "express";
import path from "path";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const app = express();
app.use(express.json({ limit: '50mb' }));

// Helper to get Gemini Client with clear error reporting
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Please add it to your project settings.");
  }
  return new GoogleGenerativeAI(apiKey);
}

const SYSTEM_INSTRUCTION = `You are a specialized Nursing Study Assistant. 
Your primary goal is to help students master nursing studies using ONLY the materials they provide (PDFs, clinical slides, medical notes, etc.).

CRITICAL RULES:
1. For MCQ generation, you MUST use the provided clinical sources (documents, slides, images). Do NOT use external knowledge for factual content, except to ensure clinical accuracy.
2. If a source is a PowerPoint/Slide deck or Document, extract the core medical concepts and nursing priorities.
3. If a source is a video link and you lack content, use the extracted transcript/content provided.
4. recommendations can suggest reputable external resources, but MCQ/Summaries must be strictly source-based.`;

// AI Endpoint: Summaries
app.post("/api/summarize", async (req, res) => {
  const { contentParts } = req.body;
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_INSTRUCTION });
    const prompt = "Please provide detailed summaries for these nursing study materials. For each material, provide a title, a comprehensive summary, and 5-7 key learning points.";
    
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [...contentParts, { text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: { type: SchemaType.STRING },
              content: { type: SchemaType.STRING },
              keyPoints: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
            },
            required: ["title", "content", "keyPoints"]
          }
        }
      }
    });
    res.json(JSON.parse(response.response.text()));
  } catch (error: any) {
    console.error("Summarize error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Endpoint: Quiz
app.post("/api/quiz", async (req, res) => {
  const { contentParts, count = 5 } = req.body;
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_INSTRUCTION });
    const prompt = `Generate ${count} strictly source-based Multiple Choice Questions (MCQs) for nursing students. 
    Ensure the questions are challenging and cover critical nursing concepts from the provided documents.
    For each question, provide 4 options, the index of the correct answer (0-3), and a detailed explanation based on the sources.`;
    
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [...contentParts, { text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              question: { type: SchemaType.STRING },
              options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
              correctAnswer: { type: SchemaType.INTEGER },
              explanation: { type: SchemaType.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    res.json(JSON.parse(response.response.text()));
  } catch (error: any) {
    console.error("Quiz error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Endpoint: Chat
app.post("/api/chat", async (req, res) => {
  const { message, contentParts, history = [] } = req.body;
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", 
      systemInstruction: SYSTEM_INSTRUCTION + "\n\nAdditional Instruction: You are a clinical chatbot. Answer the user's questions strictly based on the provided nursing materials."
    });
    
    const chat = model.startChat({ history });
    const result = await chat.sendMessage([...contentParts, { text: message }]);
    res.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// AI Endpoint: Recommendations
app.post("/api/recommendations", async (req, res) => {
  const { contentParts } = req.body;
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: SYSTEM_INSTRUCTION });
    const prompt = `Based on these nursing study materials, recommend 5 high-quality external resources (websites, journals, or video tutorials) that would help deepen my understanding. 
    Provide a specific topic for each, why it's recommended based on my current focus, and a direct URL to the resource.`;
    
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [...contentParts, { text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              topic: { type: SchemaType.STRING },
              reason: { type: SchemaType.STRING },
              link: { type: SchemaType.STRING }
            },
            required: ["topic", "reason", "link"]
          }
        }
      }
    });
    res.json(JSON.parse(response.response.text()));
  } catch (error: any) {
    console.error("Recommendations error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Existing URL Extraction
app.post("/api/extract", async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, footer, iframe, ads').remove();

    const title = $('title').text() || $('h1').first().text();
    let content = "";

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      content = $('meta[name="description"]').attr('content') || "No description available.";
    } else {
      content = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 50000);
    }

    res.json({
      title: title.trim(),
      content,
      url
    });
  } catch (error) {
    console.error("Extraction error:", error);
    res.status(500).json({ error: "Failed to extract content from URL" });
  }
});

export default app;
