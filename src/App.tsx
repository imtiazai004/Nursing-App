/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SourceManager } from './components/SourceManager';
import { SummaryView } from './components/SummaryView';
import { QuizView } from './components/QuizView';
import { RecommendationView } from './components/RecommendationView';
import { Dashboard } from './components/Dashboard';
import { ChatBot } from './components/ChatBot';
import { UploadModal } from './components/UploadModal';
import { Source, ViewState } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [sources, setSources] = useState<Source[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Load from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('nursepah_sources_meta');
    if (saved) {
      try {
        setSources(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load sources", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    // Only save metadata to avoid blowing up storage with base64
    const metadata = sources.map(s => ({ ...s, content: s.type === 'link' ? s.content : undefined }));
    localStorage.setItem('nursepah_sources_meta', JSON.stringify(metadata));
  }, [sources]);

  const addSource = (source: Source) => {
    setSources(prev => [...prev, source]);
  };

  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard sources={sources} onNavigate={setCurrentView} onQuickUpload={() => setIsUploadModalOpen(true)} />;
      case 'sources':
        return <SourceManager sources={sources} onAddSource={addSource} onRemoveSource={removeSource} />;
      case 'summarize':
        return <SummaryView sources={sources} />;
      case 'quiz':
        return <QuizView sources={sources} />;
      case 'recommendations':
        return <RecommendationView sources={sources} />;
      default:
        return <Dashboard sources={sources} onNavigate={setCurrentView} onQuickUpload={() => setIsUploadModalOpen(true)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-blue-500/30">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onQuickUpload={() => setIsUploadModalOpen(true)}
      />
      
      <main className="flex-1 p-8 lg:p-12 relative flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <ChatBot sources={sources} />
      
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        onAddSource={addSource} 
      />
    </div>
  );
}

