/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Link as LinkIcon, Trash2, File, Globe, Plus, Files, ChevronLeft } from 'lucide-react';
import { Source } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SourceManagerProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (id: string) => void;
  onBack: () => void;
}

export const SourceManager: React.FC<SourceManagerProps> = ({ sources, onAddSource, onRemoveSource, onBack }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onAddSource({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'file',
          content: base64,
          mimeType: file.type,
          size: file.size,
          addedAt: Date.now()
        });
      };
      reader.readAsDataURL(file);
    });
  }, [onAddSource]);

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
        setIsAddingLink(false);
      } catch (error) {
        console.error("Link extraction failed", error);
        // Fallback to basic link source if extraction fails
        onAddSource({
          id: Math.random().toString(36).substr(2, 9),
          name: new URL(linkUrl).hostname,
          type: 'link',
          content: linkUrl,
          addedAt: Date.now()
        });
      } finally {
        setIsExtracting(false);
      }
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 py-4 md:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/50 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Source Library</h2>
            <p className="text-sm text-white/50">Manage clinical study materials.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddingLink(!isAddingLink)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-all border border-white/20 shadow-lg"
        >
          <Plus size={18} />
          Add URL
        </button>
      </div>

      <AnimatePresence>
        {isAddingLink && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-panel p-4 flex flex-col sm:flex-row gap-3 shadow-md border-blue-500/30">
              <input 
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Paste clinical URL (e.g., https://...)"
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all placeholder:text-white/30 text-sm"
              />
              <button 
                onClick={handleAddLink}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 text-sm disabled:opacity-50"
                disabled={isExtracting}
              >
                {isExtracting ? 'Extracting...' : 'Add'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        {...getRootProps()} 
        className={`glass-panel border-2 border-dashed p-10 md:p-16 text-center transition-all cursor-pointer ${
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
        }`}
      >
        <input {...getInputProps()} />
        <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-4 md:mb-6 shadow-xl border border-blue-500/20">
          <Upload size={28} />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white">Upload clinical sources</h3>
        <p className="text-white/40 max-w-sm mx-auto mt-2 text-xs md:text-sm">
          Drop PDFs, slides, or clinical notes here to begin analysis.
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sources.map((source) => (
          <motion.div 
            layout
            key={source.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card p-4 flex items-start gap-4 group hover:bg-white/10 transition-all hover:scale-[1.02]"
          >
            <div className={`p-3 rounded-xl flex-shrink-0 ${
              source.type === 'file' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {source.type === 'file' ? <File size={20} /> : <Globe size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white/90 truncate" title={source.name}>{source.name}</p>
              <p className="text-[10px] text-white/30 mt-1 uppercase font-bold tracking-widest">
                {source.type === 'file' ? `${(source.size! / 1024).toFixed(1)} KB` : 'Clinical Link'}
              </p>
            </div>
            <button 
              onClick={() => onRemoveSource(source.id)}
              className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </motion.div>
        ))}
      </div>

      {sources.length === 0 && (
        <div className="text-center py-20 opacity-30">
          <Files size={48} className="mx-auto mb-4 text-white" />
          <p className="text-lg font-light text-white">No sources provided.</p>
        </div>
      )}
    </div>
  );
};
