/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { Source, MCQ } from '../types';
import { 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Trophy,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface QuizViewProps {
  sources: Source[];
}

export const QuizView: React.FC<QuizViewProps> = ({ sources }) => {
  const [questions, setQuestions] = useState<MCQ[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const startQuiz = async () => {
    if (sources.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await generateQuiz(sources, 5);
      setQuestions(data);
      setCurrentIdx(0);
      setScore(0);
      setShowResult(false);
      setSelectedOption(null);
      setIsAnswered(false);
    } catch (e) {
      console.error(e);
      setError('Failed to generate quiz. Please ensure your sources are valid clinical documents.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    
    const correct = selectedOption === questions[currentIdx].correctAnswer;
    if (correct) setScore(s => s + 1);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      if (score >= questions.length * 0.7) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b']
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <Loader2 size={48} className="text-blue-400 animate-spin" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">Generating Clinical Scenarios</h3>
          <p className="text-white/40">Analyzing your sources for relevant MCQs...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-2xl mx-auto glass-panel p-16 text-center"
      >
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto mb-8 border border-blue-500/20">
          <Trophy size={40} />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h2>
        <p className="text-white/50 mb-10">Clinical assessment finished based on your sources.</p>
        
        <div className="text-7xl font-bold text-blue-400 mb-12">
          {score} <span className="text-2xl text-white/20">/</span> {questions.length}
        </div>

        <button 
          onClick={startQuiz}
          className="flex items-center gap-2 px-10 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 mx-auto"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="glass-panel py-32 text-center border-dashed border-2 bg-white/5 border-white/10">
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-400 mx-auto mb-8 border border-blue-500/20">
          <ShieldCheck size={40} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Clinical Assessment</h3>
        <p className="text-white/40 max-w-md mx-auto mb-10 font-light leading-relaxed">
          Prepare for exams with source-based questions formulated directly from your uploaded content.
        </p>
        <button 
          onClick={startQuiz}
          disabled={sources.length === 0}
          className="px-10 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {sources.length === 0 ? 'Provide Sources First' : 'Begin Practice Quiz'}
        </button>
      </div>
    </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      <div className="flex justify-between items-center">
        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-bold rounded-full uppercase tracking-widest">
          Item {currentIdx + 1} of {questions.length}
        </span>
        <div className="flex items-center gap-2 font-bold text-white/40 text-xs tracking-widest uppercase">
          Score: <span className="text-blue-400">{score}</span>
        </div>
      </div>

      <div className="glass-panel p-10 md:p-14">
        <h3 className="text-2xl font-bold text-white mb-10 leading-snug">{q.question}</h3>
        
        <div className="space-y-4 mb-12">
          {q.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(idx)}
              disabled={isAnswered}
              className={cn(
                "w-full text-left px-6 py-5 rounded-2xl border transition-all flex items-center gap-4 group",
                selectedOption === idx 
                  ? "border-blue-500 bg-blue-500/10 text-white ring-2 ring-blue-500/20" 
                  : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white",
                isAnswered && idx === q.correctAnswer && "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-emerald-500/20",
                isAnswered && selectedOption === idx && idx !== q.correctAnswer && "border-red-500 bg-red-500/20 text-red-300 ring-red-500/20"
              )}
            >
              <span className={`w-8 h-8 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                isAnswered && idx === q.correctAnswer ? 'bg-emerald-500 text-white border-none' : ''
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 font-medium">{option}</span>
              {isAnswered && idx === q.correctAnswer && <CheckCircle2 className="text-emerald-400" size={24} />}
              {isAnswered && selectedOption === idx && idx !== q.correctAnswer && <XCircle className="text-red-400" size={24} />}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {isAnswered && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mb-10 p-6 glass-card bg-white/5 border-white/5 flex gap-4 overflow-hidden"
            >
              <AlertCircle className="text-blue-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1 italic">Clinical Rationale</p>
                <p className="text-sm text-white/80 leading-relaxed font-light">{q.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end pt-8 border-t border-white/10">
          {!isAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="px-12 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-30 shadow-xl shadow-blue-500/20"
            >
              Validate
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-12 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all flex items-center gap-2 group border border-white/10 shadow-lg"
            >
              {currentIdx < questions.length - 1 ? 'Go to Next' : 'Finish Assessment'}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
