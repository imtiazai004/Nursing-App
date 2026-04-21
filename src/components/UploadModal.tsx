/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Source } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (source: Source) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onAddSource }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
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
            className="relative w-full max-w-xl glass-panel p-8 shadow-2xl border-white/20"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Quick Upload</h2>
              <p className="text-white/40 text-sm">Add clinical sources to your library from any view.</p>
            </div>

            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mx-auto mb-4">
                <Upload size={24} />
              </div>
              <p className="text-white font-medium">Drop clinical files here</p>
              <p className="text-white/30 text-xs mt-1">PDF, PPSX, DOCX, or Images</p>
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
