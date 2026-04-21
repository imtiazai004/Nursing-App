/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { SourceManager } from './components/SourceManager';
import { SummaryView } from './components/SummaryView';
import { QuizView } from './components/QuizView';
import { RecommendationView } from './components/RecommendationView';
import { Dashboard } from './components/Dashboard';
import { ChatBot } from './components/ChatBot';
import { UploadModal } from './components/UploadModal';
import { InstallNotice } from './components/InstallNotice';
import { Source, ViewState, MCQ, Summary, StudyRecommendation } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { generateSummaries, generateQuiz, getRecommendations } from './services/geminiService';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [sources, setSources] = useState<Source[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // States for generated content
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [quizzes, setQuizzes] = useState<MCQ[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);

  // Loading states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isQuizzing, setIsQuizzing] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);

  // Error states
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  const startGeneration = useCallback(async (currentSources: Source[]) => {
    if (currentSources.length === 0) return;

    // Trigger all generations in parallel
    const runSummaries = async () => {
      setIsSummarizing(true);
      setSummaryError(null);
      try {
        const data = await generateSummaries(currentSources);
        setSummaries(data);
      } catch (e: any) {
        setSummaryError(e.message || 'Failed to update summaries.');
        console.error(e);
      } finally {
        setIsSummarizing(false);
      }
    };

    const runQuizzes = async () => {
      setIsQuizzing(true);
      setQuizError(null);
      try {
        const data = await generateQuiz(currentSources, 5);
        setQuizzes(data);
      } catch (e: any) {
        setQuizError(e.message || 'Failed to update MCQs.');
        console.error(e);
      } finally {
        setIsQuizzing(false);
      }
    };

    const runRecommendations = async () => {
      setIsRecommending(true);
      try {
        const data = await getRecommendations(currentSources);
        setRecommendations(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsRecommending(false);
      }
    };

    await Promise.allSettled([runSummaries(), runQuizzes(), runRecommendations()]);
  }, []);

  // Load from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('nursepah_sources_meta');
    if (saved) {
      try {
        const loadedSources = JSON.parse(saved);
        setSources(loadedSources);
        // We don't trigger generation on load because we don't have the content in localStorage
      } catch (e) {
        console.error("Failed to load sources", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    // Only save metadata to avoid blowing up storage with base64
    const metadata = sources.map(s => ({ 
      ...s, 
      content: s.type === 'link' ? s.content : undefined,
      extractedContent: s.extractedContent // Persist extracted text for links
    }));
    localStorage.setItem('nursepah_sources_meta', JSON.stringify(metadata));
  }, [sources]);

  const addSource = (source: Source) => {
    const updatedSources = [...sources, source];
    setSources(updatedSources);
    startGeneration(updatedSources);
  };

  const removeSource = (id: string) => {
    const updatedSources = sources.filter(s => s.id !== id);
    setSources(updatedSources);
    if (updatedSources.length > 0) {
      startGeneration(updatedSources);
    } else {
      setSummaries([]);
      setQuizzes([]);
      setRecommendations([]);
    }
  };

  const renderView = () => {
    const onBack = () => setCurrentView('dashboard');

    const dashboardProps = {
      sources,
      onNavigate: setCurrentView,
      onQuickUpload: () => setIsUploadModalOpen(true),
      isLoadingStates: {
        summarizing: isSummarizing,
        quizzing: isQuizzing
      },
      errors: {
        summary: summaryError,
        quiz: quizError
      },
      onRetry: () => startGeneration(sources)
    };

    switch (currentView) {
      case 'dashboard':
        return <Dashboard {...dashboardProps} />;
      case 'sources':
        return <SourceManager sources={sources} onAddSource={addSource} onRemoveSource={removeSource} onBack={onBack} />;
      case 'summarize':
        return (
          <SummaryView 
            sources={sources} 
            summaries={summaries} 
            isLoading={isSummarizing} 
            error={summaryError}
            onGenerate={() => startGeneration(sources)}
            onBack={onBack}
          />
        );
      case 'quiz':
        return (
          <QuizView 
            sources={sources} 
            questions={quizzes} 
            isLoading={isQuizzing} 
            error={quizError}
            onGenerate={() => startGeneration(sources)}
            onBack={onBack}
          />
        );
      case 'recommendations':
        return (
          <RecommendationView 
            sources={sources} 
            recommendations={recommendations} 
            isLoading={isRecommending}
            onGenerate={() => startGeneration(sources)}
            onBack={onBack}
          />
        );
      default:
        return <Dashboard {...dashboardProps} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0a0c10] text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onQuickUpload={() => setIsUploadModalOpen(true)}
      />
      
      <main className="flex-1 p-4 sm:p-8 lg:p-12 relative flex flex-col min-h-0">
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

      <InstallNotice />
    </div>
  );
}

