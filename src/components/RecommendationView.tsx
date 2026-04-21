/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Source, StudyRecommendation } from '../types';
import { ExternalLink, Loader2, Sparkles, Compass, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface RecommendationViewProps {
  sources: Source[];
  recommendations: StudyRecommendation[];
  isLoading: boolean;
  onGenerate: () => void;
  onBack: () => void;
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({ 
  sources, 
  recommendations, 
  isLoading, 
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
            <h2 className="text-2xl md:text-3xl font-bold text-white">Study Path</h2>
            <p className="text-white/50 text-sm">Curated clinical resources for your journey.</p>
          </div>
        </div>
        <button 
          onClick={onGenerate}
          disabled={isLoading || sources.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed border-none text-sm"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {isLoading ? 'Exploring...' : 'Refresh'}
        </button>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, idx) => (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={idx} 
              className="glass-panel p-5 md:p-6 group flex flex-col hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner border border-blue-500/10">
                  <Compass className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <a 
                  href={rec.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-white/20 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink className="w-[18px] h-[18px] md:w-5 md:h-5" />
                </a>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">{rec.topic}</h3>
              <p className="text-xs md:text-sm text-white/60 leading-relaxed mb-6 md:mb-8 flex-1 font-light">
                {rec.reason}
              </p>
              <a 
                href={rec.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 md:py-3 bg-white/10 text-white rounded-xl text-xs md:text-sm font-bold hover:bg-white/20 transition-all border border-white/5 shadow-md flex items-center justify-center gap-2"
              >
                Access Resource
                <ExternalLink size={14} className="opacity-50" />
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="glass-panel py-20 md:py-32 text-center border-dashed border-2 bg-white/5 border-white/10 p-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto mb-6 md:mb-8 border border-blue-500/20 shadow-inner">
              <ExternalLink className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">Broaden Perspectives</h3>
            <p className="text-white/40 max-w-md mx-auto font-light leading-relaxed text-sm md:text-base">
              Based on your clinical topics, we'll discover authoritative studies and tutorials from reputable nursing organizations.
            </p>
          </div>
        )
      )}
    </div>

  );
};
