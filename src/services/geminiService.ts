/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Source, MCQ, Summary, StudyRecommendation } from "../types";
import JSZip from 'jszip';

async function processSources(sources: Source[]) {
  return Promise.all(sources.map(async (s) => {
    if (s.content && s.type === 'file') {
      const mime = (s.mimeType || '').toLowerCase();
      
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
      
      if (mime.startsWith('text/') || s.name.endsWith('.txt')) {
        return { text: `File: ${s.name} (Text file attached)` };
      }

      return { text: `File: ${s.name} (Non-analyzable format for AI context)` };
    }
    if (s.type === 'link') {
      return { text: `Source Name: ${s.name}\nSource URL: ${s.content || 'N/A'}\nExtracted Content: ${s.extractedContent || "[No content extracted]"}` };
    }
    return { text: `Source Name: ${s.name}\nSource URL: ${s.content || 'N/A'}` };
  }));
}

export async function generateSummaries(sources: Source[]): Promise<Summary[]> {
  const contentParts = await processSources(sources);
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentParts })
  });
  return response.json();
}

export async function generateQuiz(sources: Source[], count: number = 5): Promise<MCQ[]> {
  const contentParts = await processSources(sources);
  const response = await fetch('/api/quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentParts, count })
  });
  return response.json();
}

export async function chatWithAssistant(sources: Source[], message: string, history: any[] = []): Promise<string> {
  const contentParts = await processSources(sources);
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, contentParts, history })
  });
  const data = await response.json();
  return data.text || "Error processing request.";
}

export async function getRecommendations(sources: Source[]): Promise<StudyRecommendation[]> {
  const contentParts = await processSources(sources);
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentParts })
  });
  return response.json();
}
