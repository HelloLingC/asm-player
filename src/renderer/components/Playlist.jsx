import { useCallback, useState } from 'react';

const DROPZONE_BASE_CLASSES =
  'playlist-dropzone w-full rounded-[28px] border-2 border-dashed px-6 py-6 transition-all duration-200 bg-white/80';
const DROPZONE_ACTIVE_CLASSES = 'border-indigo-400 bg-indigo-50 shadow-xl';
const DROPZONE_INACTIVE_CLASSES = 'border-slate-200 bg-white/70 hover:border-indigo-400 hover:bg-indigo-50';

export default function Playlist({ tracks, currentTrackIndex, onSelectTrack, onFilesSelected }) {
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
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    setIsDropActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    const nextTarget = event.relatedTarget;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
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

  const dropZoneClasses = [DROPZONE_BASE_CLASSES, isDropActive ? DROPZONE_ACTIVE_CLASSES : DROPZONE_INACTIVE_CLASSES].join(' ');

  return (
    <div
      className={dropZoneClasses}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-800">Playlist</p>
          <p className="text-sm text-slate-500">Drop audio files anywhere in this list or use the button.</p>
          {tracks.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">Your playlist is empty. Add audio files to begin listening.</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Add Files
        </button>
      </div>

      <div className="playlist-scroll mt-5 max-h-[clamp(220px,40vh,360px)] space-y-3 overflow-y-auto rounded-[24px] bg-white/85 p-4">
        {tracks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-slate-500">
            Drop audio files anywhere in this playlist or use the button above.
          </div>
        )}

        {tracks.map((track, index) => {
          const isActive = index === currentTrackIndex;
          return (
            <button
              key={`${track.path || track.name}-${index}`}
              type="button"
              onClick={() => onSelectTrack(index)}
              className={`flex w-full items-center justify-between rounded-[22px] px-5 py-3 text-left text-[clamp(15px,1.8vw,20px)] font-medium shadow-sm transition ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 hover:-translate-x-0.5 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{track.name}</span>
              {isActive && (
                <span className="ml-3 text-sm font-semibold uppercase tracking-wide text-white/90">Now Playing</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
