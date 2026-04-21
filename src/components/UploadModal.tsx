/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Globe, Link as LinkIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Source } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (source: Source) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onAddSource }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  const handleAddLink = async () => {
    if (linkUrl && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://'))) {
      setIsExtracting(true);
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: linkUrl })
        });
        const data = await res.json();

        onAddSource({
          id: Math.random().toString(36).substr(2, 9),
          name: data.title || new URL(linkUrl).hostname,
          type: 'link',
          content: linkUrl,
          extractedContent: data.content,
          addedAt: Date.now()
        });
        setLinkUrl('');
        onClose();
      } catch (error) {
        console.error("Link extraction failed", error);
        onAddSource({
          id: Math.random().toString(36).substr(2, 9),
          name: new URL(linkUrl).hostname,
          type: 'link',
          content: linkUrl,
          addedAt: Date.now()
        });
        onClose();
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      // 4.5MB is Vercel's limit for serverless functions, we use 4MB to be safe
      if (file.size > 4 * 1024 * 1024) {
        alert(`${file.name} is too large. Please use files smaller than 4MB for clinical analysis.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onAddSource({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'file',
          content: reader.result as string,
          mimeType: file.type,
          size: file.size,
          addedAt: Date.now()
        });
      };
      reader.readAsDataURL(file);
    });
    onClose();
  }, [onAddSource, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'text/plain': ['.txt'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl glass-panel p-6 md:p-8 shadow-2xl border-white/20"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1">Quick Upload</h2>
              <p className="text-white/40 text-xs md:text-sm">Add clinical sources and begin background analysis.</p>
            </div>

            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mx-auto mb-4">
                <Upload size={20} className="md:w-6 md:h-6" />
              </div>
              <p className="text-white font-medium text-sm md:text-base">Tap or Drop files here</p>
              <p className="text-white/30 text-[10px] md:text-xs mt-1">PDF, PPSX, DOCX, or Images</p>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest">or add link</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <div className="mt-6 flex gap-2">
              <div className="relative flex-1">
                <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input 
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Paste YouTube or webpage URL..."
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-white/20"
                />
              </div>
              <button 
                onClick={handleAddLink}
                disabled={!linkUrl || isExtracting}
                className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              >
                {isExtracting ? <Loader2 size={18} className="animate-spin" /> : 'Add'}
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 flex justify-end">
              <button 
                onClick={onClose}
                className="px-6 py-2 text-white/60 hover:text-white transition-colors font-bold text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
