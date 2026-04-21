import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function InstallNotice() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if in iframe
    setIsInIframe(window.self !== window.top);

    // Check if standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // If not standalone and not in iframe, maybe show notice
    if (!standalone) {
      // For Android/Chrome
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setIsVisible(true);
      };

      window.addEventListener('beforeinstallprompt', handler);

      // For iOS, show after short delay
      if (ios) {
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', handler);
        };
      }

      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }
  };

  const closeNotice = () => {
    setIsVisible(false);
    // Hide for current session
    sessionStorage.setItem('install-notice-dismissed', 'true');
  };

  useEffect(() => {
    if (sessionStorage.getItem('install-notice-dismissed') === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible || isStandalone) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-lg"
      >
        <div className="bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl shadow-blue-500/10">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 p-2.5 rounded-xl text-blue-400 shrink-0">
              <Smartphone size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  Use NursingAI as an App
                </h3>
                <button 
                  onClick={closeNotice}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                {isInIframe ? (
                  <span className="text-amber-400 flex items-start gap-2">
                    <Info size={16} className="shrink-0 mt-0.5" />
                    To install, you must open this app in a new tab first.
                  </span>
                ) : isIOS ? (
                  "Install NursingAI on your iPhone: tap Share and then 'Add to Home Screen'."
                ) : (
                  "Add NursingAI to your home screen for quick clinical study and offline access."
                )}
              </p>

              <div className="flex gap-3">
                {deferredPrompt && !isInIframe && (
                  <button
                    onClick={handleInstall}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Download size={18} />
                    Install Now
                  </button>
                )}
                
                {isInIframe ? (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 text-center"
                  >
                    Open in New Tab
                  </a>
                ) : (
                  <button
                    onClick={closeNotice}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-xl font-medium transition-all border border-slate-700 active:scale-95"
                  >
                    Maybe Later
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
