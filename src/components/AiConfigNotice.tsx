import React, { useState, useEffect } from 'react';
import { AlertTriangle, Key, ExternalLink, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AiConfigNotice() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/ai-status');
        const data = await res.json();
        setIsConfigured(data.configured);
      } catch (e) {
        console.error("Failed to check AI status", e);
        setIsConfigured(false);
      }
    };
    checkStatus();
  }, []);

  if (isConfigured === true || isConfigured === null) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8"
      >
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="bg-amber-500/20 p-4 rounded-2xl text-amber-500 shrink-0">
              <ShieldAlert size={32} />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-amber-200 mb-1">AI Setup Required</h3>
                <p className="text-amber-500/80 text-sm leading-relaxed">
                  Your Nursing Assistant features (Summarizer, Quiz Generator, Chat) are currently dormant. 
                  You must link your Gemini API key to activate these features.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/20 p-4 rounded-xl border border-amber-500/10">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Key size={12} /> Step 1: Get Key
                  </p>
                  <p className="text-xs text-slate-300 mb-3">Get a free API key from Google AI Studio.</p>
                  <a 
                    href="https://aistudio.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Get API Key <ExternalLink size={12} />
                  </a>
                </div>

                <div className="bg-black/20 p-4 rounded-xl border border-amber-500/10">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> Step 2: Configure
                  </p>
                  <p className="text-xs text-slate-300">
                    Add <code className="bg-amber-500/20 px-1 rounded text-white">GEMINI_API_KEY</code> to:
                  </p>
                  <ul className="text-[10px] text-slate-400 mt-2 list-disc list-inside space-y-1">
                    <li>AI Studio <strong>Settings</strong> → <strong>Secrets</strong></li>
                    <li>Vercel <strong>Project Settings</strong> → <strong>Env Vars</strong> (<em>Requires a New Deploy</em>)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
