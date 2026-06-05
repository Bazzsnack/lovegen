'use client';

import React, { useCallback } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = "image/*", 
  multiple = false, 
  maxFiles = 10,
  label = "Upload files" 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (!multiple) {
        onFileSelect([files[0]]);
      } else {
        onFileSelect(files.slice(0, maxFiles));
      }
    }
  }, [multiple, maxFiles, onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (!multiple) {
        onFileSelect([files[0]]);
      } else {
        onFileSelect(files.slice(0, maxFiles));
      }
      // FIX: Reset input so the same file can be selected again after deletion
      e.target.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-white/90">{label}</label>}
      <div 
        className={`
          relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl
          transition-colors cursor-pointer bg-black/20 group
          ${isDragging ? 'border-love-400 bg-love-500/10' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8 text-love-300" />
        </div>
        <p className="text-sm font-medium text-white mb-1">Click or drag files here</p>
        <p className="text-xs text-white/50">
          {multiple ? `Up to ${maxFiles} files` : '1 file max'}
        </p>
      </div>
    </div>
  );
}
