/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generateSummaries } from '../services/geminiService';
import { Source, Summary } from '../types';
import { Sparkles, CheckCircle2, History, Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';

interface SummaryViewProps {
  sources: Source[];
}

export const SummaryView: React.FC<SummaryViewProps> = ({ sources }) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (sources.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateSummaries(sources);
      setSummaries(data);
    } catch (e) {
      console.error(e);
      setError('Failed to generate summaries. Please ensure your sources are valid clinical documents (PDFs, Slides, or Images).');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Clinical Summaries</h2>
          <p className="text-white/50">Synthesized insights from your library.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isLoading || sources.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed border-none"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {isLoading ? 'Synthesizing...' : 'Generate New'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {summaries.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {summaries.map((summary, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="glass-panel p-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6 leading-tight">{summary.title}</h3>
              <div className="mb-10">
                <div className="markdown-body text-white/80 text-sm">
                  <ReactMarkdown>
                    {summary.content}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="space-y-3 pt-8 border-t border-white/10">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em] mb-4">Core Clinical Insights</p>
                {summary.keyPoints.map((point, pIdx) => (
                  <div key={pIdx} className="flex gap-4 items-start group">
                    <div className="mt-1 flex-shrink-0 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="glass-panel py-32 text-center border-dashed border-2 bg-white/5 border-white/10">
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto mb-8 border border-blue-500/20 shadow-inner">
              <FileText size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Synthesize Content</h3>
            <p className="text-white/40 max-w-md mx-auto font-light">
              We'll analyze your clinical materials to create structured summaries for your review.
            </p>
          </div>
        )
      )}
    </div>
  );
};
