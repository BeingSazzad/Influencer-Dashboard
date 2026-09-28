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
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Push new state into history
  const updateContent = (newValue: string) => {
    onChange(newValue);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
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

    const lastNewline = beforeCursor.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const currentLine = beforeCursor.substring(lineStart);
    let newLine: string;
    if (currentLine.startsWith(prefix)) {
      newLine = currentLine.substring(prefix.length);
    } else {
      newLine = `${prefix}${currentLine}`;
    }

    const newValue = value.substring(0, lineStart) + newLine + afterCursor;

    updateContent(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

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

  return (
    <div
      className={`border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col ${className}`}
    >
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 px-3 border-b border-neutral-200 bg-neutral-50/80">
        <div className="flex flex-wrap items-center gap-1">
          {/* History */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo (Ctrl+Z)"
            className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo (Ctrl+Y)"
            className="p-1.5 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/70 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Text Styles */}
          <button
            type="button"
            onClick={() => wrapSelection('**', '**', 'bold text')}
            title="Bold (**text**)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors font-bold cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('*', '*', 'italic text')}
            title="Italic (*text*)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('~~', '~~', 'strikethrough')}
            title="Strikethrough (~~text~~)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => prefixLine('# ')}
            title="Heading 1 (#)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => prefixLine('## ')}
            title="Heading 2 (##)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => prefixLine('### ')}
            title="Heading 3 (###)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => prefixLine('- ')}
            title="Bullet List (- item)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => prefixLine('1. ')}
            title="Numbered List (1. item)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-neutral-300 mx-1" />

          {/* Quotes & Blocks */}
          <button
            type="button"
            onClick={() => prefixLine('> ')}
            title="Blockquote (> quote)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('`', '`', 'code')}
            title="Inline Code (`code`)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => wrapSelection('[', '](https://example.com)', 'link text')}
            title="Insert Link [text](url)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertBlock('---')}
            title="Horizontal Divider (---)"
            className="p-1.5 text-neutral-700 hover:text-neutral-950 hover:bg-neutral-200/70 rounded-lg transition-colors cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-neutral-400 bg-neutral-200/60 px-2 py-0.5 rounded">
            Markdown
          </span>
        </div>
      </div>

      {/* Editor Body - Clean Full Width Textarea */}
      <div className="flex-1 min-h-[380px] flex">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => updateContent(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="w-full h-full p-4 sm:p-5 font-sans text-sm text-neutral-900 bg-white outline-none resize-y leading-relaxed font-normal placeholder:text-neutral-400 focus:bg-neutral-50/10"
        />
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
      </div>
    </div>
  );
};
