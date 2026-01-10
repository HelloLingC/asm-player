import { useState, useCallback } from 'react';
import { Eraser, FilePenLine, FileUp, Maximize2 } from 'lucide-react';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-[20px] border border-transparent px-6 py-3 text-[clamp(14px,1.6vw,18px)] font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
const ICON_CLASS = 'h-5 w-5';

export default function SubtitleControls({ hasSubtitles, onSubtitleSelected, onToggleFullscreen, onClear }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSubtitleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.name.toLowerCase().endsWith('.srt')) {
        alert('Please select a .srt subtitle file');
        return;
      }
      onSubtitleSelected?.(file);
    },
    [onSubtitleSelected],
  );

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.srt';
    input.onchange = (event) => handleSubtitleFile(event.target?.files?.[0]);
    input.click();
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    handleSubtitleFile(event.dataTransfer?.files?.[0]);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-2">
      <button
        type="button"
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`${BUTTON_BASE} bg-gradient-to-br from-indigo-500 to-purple-600 ${
          isDragOver ? 'scale-[1.03] border-indigo-200 shadow-2xl' : ''
        } focus-visible:outline-indigo-400`}
      >
        {hasSubtitles ? (
          <>
            <FilePenLine aria-hidden="true" className={ICON_CLASS} />
            <span>Change Subtitle</span>
          </>
        ) : (
          <>
            <FileUp aria-hidden="true" className={ICON_CLASS} />
            <span>Load Subtitle</span>
          </>
        )}
      </button>

      {hasSubtitles && (
        <>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`${BUTTON_BASE} bg-gradient-to-br from-emerald-500 to-lime-400 focus-visible:outline-emerald-300`}
          >
            <Maximize2 aria-hidden="true" className={ICON_CLASS} />
            <span>Fullscreen</span>
          </button>
          <button
            type="button"
            onClick={onClear}
            className={`${BUTTON_BASE} bg-gradient-to-br from-pink-400 to-rose-500 focus-visible:outline-rose-400`}
          >
            <Eraser aria-hidden="true" className={ICON_CLASS} />
            <span>Clear</span>
          </button>
        </>
      )}
    </div>
  );
}
