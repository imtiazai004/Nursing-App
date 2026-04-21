/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Source {
  id: string;
  name: string;
  type: 'file' | 'link';
  content?: string; // Base64 for files, URL for links
  extractedContent?: string; // For links: the fetched text content
  mimeType?: string;
  size?: number;
  addedAt: number;
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Summary {
  title: string;
  content: string;
  keyPoints: string[];
}

export interface StudyRecommendation {
  topic: string;
  reason: string;
  link: string;
}

export type ViewState = 'dashboard' | 'sources' | 'summarize' | 'quiz' | 'recommendations';
