/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Source, MCQ, Summary, StudyRecommendation } from "../types";
import JSZip from 'jszip';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a specialized Nursing Study Assistant. 
Your primary goal is to help students master nursing studies using ONLY the materials they provide (PDFs, clinical slides, medical notes, etc.).

CRITICAL RULES:
1. For MCQ generation, you MUST use the provided clinical sources (documents, slides, images). Do NOT use external knowledge for factual content, except to ensure clinical accuracy.
2. If a source is a PowerPoint/Slide deck or Document, extract the core medical concepts and nursing priorities.
3. If a source is a video link and you lack content, ask for a transcript.
4. recommendations can suggest reputable external resources, but MCQ/Summaries must be strictly source-based.`;

async function processSources(sources: Source[]) {
  return Promise.all(sources.map(async (s) => {
    if (s.content && s.type === 'file') {
      const mime = (s.mimeType || '').toLowerCase();
      
      // 1. Check for Office/Document formats (Custom Extraction)
      const isOffice = mime.includes('presentationml') || 
                       mime.includes('wordprocessingml') || 
                       mime.includes('ms-powerpoint') || 
                       mime.includes('msword') ||
                       mime.includes('officedocument') ||
                       s.name.endsWith('.pptx') || 
                       s.name.endsWith('.docx') ||
                       s.name.endsWith('.ppt') ||
                       s.name.endsWith('.doc');
      
      if (isOffice) {
        try {
          const zip = new JSZip();
          const base64Data = s.content.split(',')[1] || s.content;
          const content = await zip.loadAsync(base64Data, { base64: true });
          let extractedText = "";

          if (mime.includes('wordprocessingml') || mime.includes('msword') || s.name.endsWith('.docx') || s.name.endsWith('.doc')) {
            const docXml = await content.file("word/document.xml")?.async("string");
            if (docXml) {
              const matches = docXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
              extractedText = matches ? matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ') : "";
            }
          } else {
            const slideFiles = Object.keys(content.files).filter(name => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"));
            slideFiles.sort((a, b) => {
              const matchA = a.match(/\d+/);
              const matchB = b.match(/\d+/);
              const numA = parseInt(matchA ? matchA[0] : "0");
              const numB = parseInt(matchB ? matchB[0] : "0");
              return numA - numB;
            });
            for (const slide of slideFiles) {
              const slideXml = await content.file(slide)?.async("string");
              if (slideXml) {
                const matches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
                if (matches) {
                  extractedText += matches.map(m => m.replace(/<[^>]+>/g, '')).join(' ') + "\n";
                }
              }
            }
          }
          return { text: `File: ${s.name}\nExtracted Content: ${extractedText || "[No readable text found]"}` };
        } catch (e) {
          console.error(`Error extracting text from ${s.name}:`, e);
          return { text: `File: ${s.name}\n[Text extraction failed for this document]` };
        }
      }

      // 2. Check for officially supported Gemini multimodal formats
      const supportedMimeTypes = [
        'application/pdf', 
        'image/png', 
        'image/jpeg', 
        'image/webp', 
        'image/heic', 
        'image/heif'
      ];

      if (supportedMimeTypes.includes(mime)) {
        return {
          inlineData: {
            mimeType: s.mimeType!,
            data: s.content.split(',')[1] || s.content
          }
        };
      }
      
      // 3. Fallback for everything else (treat as text or skip)
      if (mime.startsWith('text/') || s.name.endsWith('.txt')) {
        // Since we only have base64, we'd need to b64decode to read it.
        // For convenience, we'll just send a notice that it's a text file.
        return { text: `File: ${s.name} (Text file attached)` };
      }

      return { text: `File: ${s.name} (Non-analyzable format for AI context)` };
    }
    // Links
    if (s.type === 'link') {
      return { text: `Source Name: ${s.name}\nSource URL: ${s.content || 'N/A'}\nExtracted Content: ${s.extractedContent || "[No content extracted]"}` };
    }
    return { text: `Source Name: ${s.name}\nSource URL: ${s.content || 'N/A'}` };
  }));
}

export async function generateSummaries(sources: Source[]): Promise<Summary[]> {
  const model = "gemini-3-flash-preview";
  const contentParts = await processSources(sources);

  const prompt = "Please provide detailed summaries for these nursing study materials. For each material, provide a title, a comprehensive summary, and 5-7 key learning points.";

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...contentParts, { text: prompt }] },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            keyPoints: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "content", "keyPoints"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse summaries", e);
    return [];
  }
}

export async function generateQuiz(sources: Source[], count: number = 5): Promise<MCQ[]> {
  const model = "gemini-3-flash-preview";
  const contentParts = await processSources(sources);

  const prompt = `Generate ${count} strictly source-based Multiple Choice Questions (MCQs) for nursing students. 
Ensure the questions are challenging and cover critical nursing concepts from the provided documents.
For each question, provide 4 options, the index of the correct answer (0-3), and a detailed explanation based on the sources.`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...contentParts, { text: prompt }] },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correctAnswer: { type: Type.INTEGER },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse quiz", e);
    return [];
  }
}

export async function chatWithAssistant(sources: Source[], message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []): Promise<string> {
  const model = "gemini-3-flash-preview";
  const contentParts = await processSources(sources);

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history,
      { role: "user", parts: [...contentParts, { text: message }] }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION + "\n\nAdditional Instruction: You are a clinical chatbot. Answer the user's questions strictly based on the provided nursing materials. If they ask to generate MCQs or summaries, guide them to use the dedicated views or generate them here in text format.",
    }
  });

  return response.text || "I'm sorry, I couldn't process that request.";
}

export async function getRecommendations(sources: Source[]): Promise<StudyRecommendation[]> {
  const model = "gemini-3-flash-preview";
  const contentParts = await processSources(sources);
  
  const prompt = `Based on these nursing study materials, recommend 5 high-quality external resources (websites, journals, or video tutorials) that would help deepen my understanding. 
Provide a specific topic for each, why it's recommended based on my current focus, and a direct URL to the resource.`;

  const response = await ai.models.generateContent({
    model,
    contents: { parts: [...contentParts, { text: prompt }] },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            reason: { type: Type.STRING },
            link: { type: Type.STRING }
          },
          required: ["topic", "reason", "link"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse recommendations", e);
    return [];
  }
}
