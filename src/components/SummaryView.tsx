/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Source, Summary } from '../types';
import { Sparkles, CheckCircle2, Loader2, FileText, ChevronLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';

interface SummaryViewProps {
  sources: Source[];
  summaries: Summary[];
  isLoading: boolean;
  error: string | null;
  onGenerate: () => void;
  onBack: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ 
  sources, 
  summaries, 
  isLoading, 
  error, 
  onGenerate,
  onBack 
}) => {
  return (
    <div className="space-y-6 md:space-y-8 py-4 md:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Clinical Summaries</h2>
            <p className="text-white/50 text-sm">Synthesized insights from your library.</p>
          </div>
        </div>
        <button 
          onClick={onGenerate}
          disabled={isLoading || sources.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed border-none text-sm"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {isLoading ? 'Synthesizing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {summaries.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
          {summaries.map((summary, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx} 
              className="glass-panel p-6 md:p-8"
            >
              <h3 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 leading-tight">{summary.title}</h3>
              <div className="mb-6 md:mb-10">
                <div className="markdown-body text-white/80 text-xs md:text-sm">
                  <ReactMarkdown>
                    {summary.content}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="space-y-3 pt-6 md:pt-8 border-t border-white/10">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em] mb-4">Core Clinical Insights</p>
                {summary.keyPoints.map((point, pIdx) => (
                  <div key={pIdx} className="flex gap-3 md:gap-4 items-start group">
                    <div className="mt-1 flex-shrink-0 text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity">
                      <CheckCircle2 className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                    </div>
                    <p className="text-xs md:text-sm text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{point}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="glass-panel py-20 md:py-32 text-center border-dashed border-2 bg-white/5 border-white/10 p-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto mb-6 md:mb-8 border border-blue-500/20 shadow-inner">
              <FileText className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Synthesize Content</h3>
            <p className="text-white/40 max-w-md mx-auto font-light text-sm md:text-base">
              We'll analyze your clinical materials to create structured summaries for your review.
            </p>
          </div>
        )
      )}
    </div>

  );
};
