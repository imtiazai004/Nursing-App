/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Source, ViewState } from '../types';
import { 
  PlusCircle, 
  BookOpen, 
  BrainCircuit, 
  GraduationCap,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  sources: Source[];
  onNavigate: (view: ViewState) => void;
  onQuickUpload: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ sources, onNavigate, onQuickUpload }) => {
  const stats = [
    { label: 'Sources', value: sources.length, icon: BookOpen, color: 'bg-blue-500' },
    { label: 'Summaries', value: sources.length > 0 ? sources.length : 0, icon: BrainCircuit, color: 'bg-indigo-500/50' },
    { label: 'Knowledge', value: sources.length > 0 ? 'Ready' : 'Pending', icon: GraduationCap, color: 'bg-emerald-500/50' },
  ];

  return (
    <div className="space-y-8 py-6">
      <div className="relative overflow-hidden glass-panel p-10 text-white min-h-[400px] flex flex-col justify-center">
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4"
          >
            <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-[11px] font-bold uppercase tracking-[0.05em] text-blue-300">
              Active Study Mode
            </span>
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold mb-6 leading-tight"
          >
            Master Nursing with <span className="text-blue-400">NurseNotes</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/70 text-lg mb-8 leading-relaxed font-light"
          >
            Transform your clinical materials into concise summaries and strictly source-based MCQs.
          </motion.p>
          <div className="flex gap-4">
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onQuickUpload}
              className="flex items-center gap-2 px-8 py-3.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 border-none"
            >
              <PlusCircle size={20} />
              Quick Upload
            </motion.button>
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => onNavigate('sources')}
              className="flex items-center gap-2 px-8 py-3.5 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Library
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 flex items-center gap-5">
            <div className={`p-3 rounded-xl ${stat.color} text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Recent Sources</h3>
            <button onClick={() => onNavigate('sources')} className="text-xs font-bold text-blue-400 flex items-center gap-1 hover:text-blue-300">
              View Library <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-3">
            {sources.length > 0 ? (
              sources.slice(0, 3).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-4 glass-card border-white/5 bg-white/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-white/10 rounded-lg flex-shrink-0">
                      <BookOpen size={16} className="text-blue-300" />
                    </div>
                    <p className="text-sm font-semibold text-white/90 truncate">{s.name}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(s.addedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/40 text-center py-6 italic">No sources added yet.</p>
            )}
          </div>
        </div>

        <div className="glass-panel p-8 flex flex-col justify-between bg-blue-600/20 border-blue-500/30">
          <div>
            <h3 className="text-xl font-bold mb-3 text-white">Quick Review</h3>
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              Start a new session based on your clinical materials.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('summarize')}
              className="p-4 glass-card hover:bg-white/10 transition-all text-center flex flex-col items-center gap-2 border-white/10"
            >
              <BrainCircuit size={24} className="text-blue-400" />
              <p className="text-xs font-bold text-white mt-1">Summary</p>
            </button>
            <button 
              onClick={() => onNavigate('quiz')}
              className="p-4 glass-card hover:bg-white/10 transition-all text-center flex flex-col items-center gap-2 border-white/10"
            >
              <GraduationCap size={24} className="text-emerald-400" />
              <p className="text-xs font-bold text-white mt-1">Practice Quiz</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
