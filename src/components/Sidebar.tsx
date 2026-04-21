/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Files, 
  FileText, 
  ShieldCheck, 
  ExternalLink,
  BookOpen,
  PlusCircle
} from 'lucide-react';
import { ViewState } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  onQuickUpload: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onQuickUpload }) => {
  const items = [
    { id: 'dashboard' as ViewState, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'sources' as ViewState, icon: Files, label: 'Sources' },
    { id: 'summarize' as ViewState, icon: FileText, label: 'Summaries' },
    { id: 'quiz' as ViewState, icon: ShieldCheck, label: 'MCQs' },
    { id: 'recommendations' as ViewState, icon: ExternalLink, label: 'Resources' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 glass-panel m-6 h-[calc(100vh-48px)] flex-col sticky top-6 border-none rounded-[24px]">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white">NurseNotes</h1>
            <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Clinical Study Buddy</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <button
            onClick={onQuickUpload}
            className="w-full flex items-center gap-3 px-3 py-4 mb-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-bold hover:bg-blue-500 hover:text-white transition-all group"
          >
            <PlusCircle size={18} className="group-hover:rotate-90 transition-transform" />
            Quick Upload
          </button>

          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all",
                currentView === item.id 
                  ? "bg-blue-500 text-white shadow-lg" 
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="glass-card p-4">
            <p className="text-[11px] font-bold text-white/40 uppercase mb-2 tracking-wider">Guard</p>
            <p className="text-xs text-white/80 leading-relaxed">
              Generating clinical content strictly from provided sources.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] glass-panel rounded-t-3xl border-t border-white/10 p-2 flex items-center justify-around pb-safe">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              currentView === item.id 
                ? "text-blue-400" 
                : "text-white/40 hover:text-white/60"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};
