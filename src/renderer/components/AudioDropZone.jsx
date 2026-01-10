import { useState, useCallback } from 'react';

const BASE_CLASSES =
  'cursor-pointer select-none rounded-[28px] border-2 border-dashed px-6 py-[clamp(48px,6vw,80px)] text-center text-[clamp(18px,2vw,28px)] font-semibold leading-snug transition-all duration-200';
const ACTIVE_CLASSES = 'scale-[1.01] border-indigo-400 bg-indigo-50 text-indigo-500 shadow-xl';
const INACTIVE_CLASSES = 'border-slate-300 bg-white/70 text-slate-500 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500';

export default function AudioDropZone({ onFilesSelected }) {
  const [isDropActive, setIsDropActive] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      if (!files || files.length === 0) return;
      onFilesSelected?.(files);
    },
    [onFilesSelected],
  );

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDropActive(false);
    handleFiles(event.dataTransfer?.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDropActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDropActive(false);
  };

  const handleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = (e) => handleFiles(e.target?.files);
    input.click();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={[BASE_CLASSES, isDropActive ? ACTIVE_CLASSES : INACTIVE_CLASSES].join(' ')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p>Drop audio files here</p>
      <p className="mt-2 text-base font-medium text-slate-500">or click to select</p>
    </div>
  );
}
