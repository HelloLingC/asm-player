import { useEffect } from 'react';

export default function FullscreenSubtitle({ subtitle, onClose, isPlaying, currentTrack, onPlayPause }) {
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        onPlayPause();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose, onPlayPause]);

  return (
    <div className="animate-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-10" onClick={onClose}>
      <div
        className="relative flex h-[80vh] w-full max-w-5xl flex-col rounded-[32px] border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 text-white shadow-2xl backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 text-2xl transition hover:rotate-90 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
          onClick={onClose}
          aria-label="Close fullscreen subtitles"
        >
          ✕
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 text-base text-white/70">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            {isPlaying ? '▶ Playing' : '⏸ Paused'}
          </div>
          {currentTrack >= 0 && (
            <div className="text-sm font-medium uppercase tracking-wider text-white/70">
              Track {currentTrack + 1}
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6 text-center">
          {subtitle ? (
            <div className="animate-subtitle space-y-4 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
              {subtitle.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          ) : (
            <div className="text-2xl font-medium text-white/40">No subtitle at this moment</div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 pt-4 text-sm uppercase tracking-wider text-white/50">
          <span>Press SPACE to play/pause</span>
          <span className="hidden text-white/30 sm:inline">•</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
