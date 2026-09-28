import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ImageUploadBoxProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  recommendedDimensions?: string;
  aspectRatio?: 'wide' | 'square' | 'avatar';
  previewBg?: 'dark' | 'light' | 'grid';
  className?: string;
  maxSizeMb?: number;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label,
  description,
  value,
  onChange,
  recommendedDimensions = 'SVG, PNG, JPG, or WebP up to 5MB',
  aspectRatio = 'wide',
  previewBg = 'light',
  className = '',
  maxSizeMb = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlFallback, setShowUrlFallback] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileProcess = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setErrorMsg(`File size exceeds ${maxSizeMb}MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlFallback(false);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-800">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-neutral-500 font-medium">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowUrlFallback(!showUrlFallback)}
          className="text-[11px] font-bold text-neutral-400 hover:text-brand-pink transition-colors flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlFallback ? 'Hide URL input' : 'Paste link instead'}
        </button>
      </div>

      {showUrlFallback && (
        <div className="flex gap-2 p-2 rounded-xl bg-neutral-50 border border-neutral-200">
          <input
            type="text"
            placeholder="Paste direct https:// image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-neutral-200 bg-white outline-none focus:border-brand-pink font-medium"
          />
          <Button size="sm" variant="outline" onClick={handleApplyUrl} type="button">
            Apply
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/x-icon, image/gif"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Dropzone / Preview Area */}
      {value ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed border-neutral-200 hover:border-brand-pink/60 rounded-2xl p-4 transition-all duration-200 ${
            previewBg === 'dark'
              ? 'bg-[#0A0A0A] text-white'
              : previewBg === 'grid'
              ? 'bg-neutral-100 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px]'
              : 'bg-white'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Visual Preview */}
            <div
              className={`flex items-center justify-center overflow-hidden border border-neutral-200/40 ${
                aspectRatio === 'avatar'
                  ? 'w-20 h-20 rounded-full'
                  : aspectRatio === 'square'
                  ? 'w-24 h-24 rounded-xl'
                  : 'w-48 h-20 rounded-xl'
              } ${previewBg === 'dark' ? 'bg-neutral-900' : 'bg-neutral-50'}`}
            >
              <img
                src={value}
                alt={label}
                className="max-h-full max-w-full object-contain p-1.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            {/* Info & Actions */}
            <div className="flex-1 space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  Asset Uploaded
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  {aspectRatio === 'avatar' ? 'Profile Avatar' : 'Active Brand Graphic'}
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-700 truncate max-w-xs">
                Click anywhere to upload replacement
              </p>
              <p className="text-[11px] text-neutral-400 font-medium">
                {recommendedDimensions}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold text-xs"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Change
              </Button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove asset"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-200 ${
            isDragging
              ? 'border-brand-pink bg-pink-50/50 scale-[0.99]'
              : 'border-neutral-300 hover:border-brand-pink hover:bg-neutral-50/80 bg-white'
          }`}
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-pink-50 group-hover:text-brand-pink transition-colors">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-neutral-800">
            <span className="text-brand-pink underline underline-offset-2">
              Click to browse
            </span>{' '}
            or drag and drop your file here
          </p>
          <p className="text-[11px] text-neutral-400 font-medium mt-1">
            {recommendedDimensions}
          </p>
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 animate-in fade-in">
          <span>•</span>
          {errorMsg}
        </p>
      )}
    </div>
  );
};
