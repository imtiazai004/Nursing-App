/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getRecommendations } from '../services/geminiService';
import { Source, StudyRecommendation } from '../types';
import { ExternalLink, Loader2, Sparkles, Compass } from 'lucide-react';
import { motion } from 'motion/react';

interface RecommendationViewProps {
  sources: Source[];
}

export const RecommendationView: React.FC<RecommendationViewProps> = ({ sources }) => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (sources.length === 0) return;
    setIsLoading(true);
    try {
      const data = await getRecommendations(sources);
      setRecommendations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Study Path</h2>
          <p className="text-white/50">Curated clinical resources for your journey.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={isLoading || sources.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed border-none"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          {isLoading ? 'Exploring...' : 'Find Resources'}
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
              className="glass-panel p-6 group flex flex-col hover:bg-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-inner border border-blue-500/10">
                  <Compass size={24} />
                </div>
                <a 
                  href={rec.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-white/20 hover:text-blue-400 transition-colors"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{rec.topic}</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-8 flex-1 font-light">
                {rec.reason}
              </p>
              <a 
                href={rec.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-3 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-all border border-white/5 shadow-md flex items-center justify-center gap-2"
              >
                Access Resource
                <ExternalLink size={14} className="opacity-50" />
              </a>
            </motion.div>
          ))}
        </div>
      ) : (
        !isLoading && (
          <div className="glass-panel py-32 text-center border-dashed border-2 bg-white/5 border-white/10">
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto mb-8 border border-blue-500/20 shadow-inner">
              <ExternalLink size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Broaden Perspectives</h3>
            <p className="text-white/40 max-w-md mx-auto font-light leading-relaxed">
              Based on your clinical topics, we'll discover authoritative studies and tutorials from reputable nursing organizations.
            </p>
          </div>
        )
      )}
    </div>
  );
};
