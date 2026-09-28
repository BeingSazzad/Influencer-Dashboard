import React, { useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Minus,
  Undo2,
  Redo2,
  Eye,
  Edit3,
  Columns,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your document...',
  minHeight = '420px',
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Push new state into history
  const updateContent = (newValue: string) => {
    onChange(newValue);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    // Keep last 30 states
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  // Helper to wrap selected text or insert snippet
  const wrapSelection = (before: string, after: string = before, defaultText = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || defaultText;

    const replacement = `${before}${selectedText}${after}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    updateContent(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  // Helper to prefix current line
  const prefixLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);

    // Find start of current line
    const lastNewline = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const currentLine = beforeCursor.substring(lineStart);
    // If already prefixed with this prefix, toggle it off
    let newLine: string;
    if (currentLine.startsWith(prefix)) {
      newLine = currentLine.substring(prefix.length);
    } else {
      newLine = `${prefix}${currentLine}`;
    }

    const newValue =
      value.substring(0, lineStart) + newLine + afterCursor;

    updateContent(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        lineStart + newLine.length,
        lineStart + newLine.length
      );
    }, 0);
  };

  // Insert block at current position
  const insertBlock = (block: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const prefix = start > 0 && value[start - 1] !== '\n' ? '\n\n' : '';
    const suffix = end < value.length && value[end] !== '\n' ? '\n\n' : '\n';

    const fullInsert = `${prefix}${block}${suffix}`;
    const newValue = value.substring(0, start) + fullInsert + value.substring(end);

    updateContent(newValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + fullInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Stats calculation
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const characters = value.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  // Render markdown preview
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="p-3.5 my-2.5 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto border border-neutral-800"
            >
              <code>{codeBlockContent.join('\n')}</code>
            </pre>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1
            key={index}
            className="text-xl font-black text-neutral-950 mt-5 mb-2 pb-2 border-b border-neutral-200"
          >
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2
            key={index}
            className="text-base font-extrabold text-neutral-900 mt-4 mb-2"
          >
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3
            key={index}
            className="text-sm font-bold text-neutral-900 mt-3 mb-1.5"
          >
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        // Blockquote
        elements.push(
          <blockquote
            key={index}
            className="border-l-4 border-brand-pink/70 pl-3.5 py-1.5 text-sm italic text-neutral-700 bg-pink-50/40 rounded-r-lg my-2 font-medium"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        // Unordered list
        elements.push(
          <li
            key={index}
            className="text-sm text-neutral-800 list-disc ml-5 my-1 leading-relaxed"
          >
            {formatInline(line.trim().replace(/^[-*]\s+/, ''))}
          </li>
        );
      } else if (/^\d+\.\s+/.test(line.trim())) {
        // Ordered list
        elements.push(
          <li
            key={index}
            className="text-sm text-neutral-800 list-decimal ml-5 my-1 leading-relaxed"
          >
            {formatInline(line.trim().replace(/^\d+\.\s+/, ''))}
          </li>
        );
      } else if (line.trim() === '---' || line.trim() === '***') {
        // Horizontal rule
        elements.push(<hr key={index} className="my-4 border-neutral-200" />);
      } else if (line.trim() === '') {
        // Empty line
        elements.push(<div key={index} className="h-2" />);
      } else {
        // Normal paragraph
        elements.push(
          <p key={index} className="text-sm text-neutral-800 leading-relaxed my-2">
            {formatInline(line)}
          </p>
        );
      }
    });

    return elements;
  };

  // Inline formatting helper (Bold, Italic, Code, Links)
  const formatInline = (text: string): React.ReactNode => {
    // Quick regex inline formatting
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-neutral-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-neutral-800">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-[11px] text-neutral-900 font-semibold"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const title = part.substring(1, part.indexOf(']('));
        const url = part.substring(part.indexOf('](') + 2, part.length - 1);
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-brand-pink font-bold underline hover:text-pink-600"
          >
            {title}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`border border-neutral-200 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col ${className}`}>
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-neutral-50/90 border-b border-neutral-200">
        <div className="flex flex-wrap items-center gap-0.5">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Text Styles */}
          <button
            type="button"
            onClick={() => wrapSelection('**', '**', 'bold text')}
            title="Bold (**text**)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors font-bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*', 'italic text')}
            title="Italic (*text*)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('~~', '~~', 'strikethrough')}
            title="Strikethrough (~~text~~)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => prefixLine('# ')}
            title="Heading 1 (#)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => prefixLine('## ')}
            title="Heading 2 (##)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => prefixLine('### ')}
            title="Heading 3 (###)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => prefixLine('- ')}
            title="Bullet List (- item)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => prefixLine('1. ')}
            title="Numbered List (1. item)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Quotes & Blocks */}
          <button
            type="button"
            onClick={() => prefixLine('> ')}
            title="Blockquote (> quote)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('`', '`', 'code')}
            title="Inline Code (`code`)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('[', '](https://example.com)', 'link text')}
            title="Insert Link [text](url)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('---')}
            title="Horizontal Divider (---)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-neutral-200/60 p-0.5 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'edit'
                ? 'bg-white text-neutral-950 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'split'
                ? 'bg-white text-neutral-950 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
              viewMode === 'preview'
                ? 'bg-white text-neutral-950 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-[380px] flex">
        {/* Write Surface */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`flex-1 flex flex-col ${
              viewMode === 'split' ? 'border-r border-neutral-200' : ''
            }`}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => updateContent(e.target.value)}
              placeholder={placeholder}
              style={{ minHeight }}
              className="w-full h-full p-4 font-sans text-sm text-neutral-900 bg-white outline-none resize-y leading-relaxed font-normal placeholder:text-neutral-400 focus:bg-neutral-50/20"
            />
          </div>
        )}

        {/* Live Preview Surface */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            style={{ minHeight }}
            className="flex-1 p-5 overflow-y-auto bg-neutral-50/40 text-neutral-900"
          >
            {value.trim() ? (
              <div className="max-w-none">{renderMarkdown(value)}</div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-neutral-400 italic">
                Document preview will appear here as you write...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-50/80 border-t border-neutral-100 text-[11px] text-neutral-500 font-semibold">
        <div className="flex items-center gap-3">
          <span>
            <strong className="text-neutral-800">{words}</strong> words
          </span>
          <span>•</span>
          <span>
            <strong className="text-neutral-800">{characters}</strong> chars
          </span>
          <span>•</span>
          <span>~{readingTimeMinutes} min read</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-200/50 px-2 py-0.5 rounded">
            Markdown Supported
          </span>
        </div>
      </div>
    </div>
  );
};
