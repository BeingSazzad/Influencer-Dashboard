import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
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
  recommendedDimensions,
  aspectRatio = 'wide',
  className = '',
  maxSizeMb = 5,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-bold text-neutral-900 block">
        {label}
      </label>
      {description && (
        <p className="text-[11px] text-neutral-500 font-medium">{description}</p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/svg+xml, image/x-icon, image/gif"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Preview or Upload Box */}
      {value ? (
        <div className="border border-neutral-200 rounded-xl p-3 bg-neutral-50/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`flex items-center justify-center overflow-hidden border border-neutral-200 bg-white shrink-0 ${
                aspectRatio === 'avatar'
                  ? 'w-12 h-12 rounded-full'
                  : aspectRatio === 'square'
                  ? 'w-12 h-12 rounded-lg'
                  : 'w-24 h-12 rounded-lg'
              }`}
            >
              <img
                src={value}
                alt={label}
                className="max-h-full max-w-full object-contain p-1"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {recommendedDimensions && (
              <span className="text-[11px] text-neutral-500 font-medium truncate">
                {recommendedDimensions}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs h-7 px-2 font-bold"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border border-dashed rounded-xl p-4 text-center transition-all ${
            isDragging
              ? 'border-brand-pink bg-pink-50/50'
              : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50/50'
          }`}
        >
          <Upload className="w-5 h-5 mx-auto mb-1 text-neutral-400" />
          <p className="text-xs font-semibold text-neutral-800">
            Upload {label.toLowerCase()}
          </p>
          {recommendedDimensions && (
            <p className="text-[10px] text-neutral-500 mt-0.5 font-medium">
              {recommendedDimensions}
            </p>
          )}
        </div>
      )}

      {errorMsg && (
        <p className="text-[11px] font-semibold text-rose-600">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
