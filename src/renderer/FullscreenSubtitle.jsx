import { useEffect, useState } from 'react';
import { PauseCircle, PlayCircle, Settings, X } from 'lucide-react';

const DEFAULT_FONT_SIZE = 56;
const FONT_SIZE_MIN = 32;
const FONT_SIZE_MAX = 96;

const clampFontSize = (value) => {
  if (Number.isNaN(value)) return DEFAULT_FONT_SIZE;
  return Math.min(Math.max(value, FONT_SIZE_MIN), FONT_SIZE_MAX);
};

export default function FullscreenSubtitle({ subtitle, onClose, isPlaying, currentTrack }) {
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const handleFontSizeChange = (event) => {
    const nextValue = clampFontSize(parseInt(event.target.value, 10));
    setFontSize(nextValue);
  };

  const handleResetFontSize = () => {
    setFontSize(DEFAULT_FONT_SIZE);
  };

  return (
    <div
      className="animate-overlay absolute inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-10"
      onClick={onClose}
    >
      <div
        className="relative flex h-[80vh] w-full max-w-5xl flex-col rounded-[32px] border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 text-white shadow-2xl backdrop-blur"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute right-5 top-5 flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              className={`flex h-12 w-12 items-center justify-center rounded-full border bg-white/10 text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                isSettingsOpen
                  ? 'border-white/70 bg-white/20 focus-visible:outline-white'
                  : 'border-white/40 hover:bg-white/20 focus-visible:outline-white/60'
              }`}
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-label="Subtitle settings"
              aria-expanded={isSettingsOpen}
            >
              <Settings aria-hidden="true" className="h-6 w-6" />
            </button>

            {isSettingsOpen && (
              <div
                role="dialog"
                aria-label="Subtitle font size settings"
                className="absolute right-0 z-10 mt-3 w-64 rounded-2xl border border-white/20 bg-black/90 p-4 text-white shadow-2xl"
              >
                <div className="flex items-center justify-between text-sm uppercase tracking-wide text-white/70">
                  <span>Font Size</span>
                  <button
                    type="button"
                    onClick={handleResetFontSize}
                    className="text-xs font-semibold text-white/70 transition hover:text-white"
                  >
                    Reset
                  </button>
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">{fontSize}px</div>
                <input
                  type="range"
                  min={FONT_SIZE_MIN}
                  max={FONT_SIZE_MAX}
                  step={2}
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  className="mt-3 w-full accent-white"
                  aria-label="Adjust subtitle font size"
                />
                <p className="mt-2 text-xs text-white/60">Drag the slider to adjust fullscreen subtitle size.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:rotate-90 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
            onClick={onClose}
            aria-label="Close fullscreen subtitles"
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 text-base text-white/70">
          <div className="flex items-center gap-2 text-lg font-semibold text-white">
            {isPlaying ? (
              <>
                <PlayCircle aria-hidden="true" className="h-6 w-6" />
                <span>Playing</span>
              </>
            ) : (
              <>
                <PauseCircle aria-hidden="true" className="h-6 w-6" />
                <span>Paused</span>
              </>
            )}
          </div>
          {currentTrack >= 0 && (
            <div className="text-sm font-medium uppercase tracking-wider text-white/70">
              Track {currentTrack + 1}
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-6 text-center">
          {subtitle ? (
            <div
              className="animate-subtitle space-y-4 font-semibold leading-tight text-white"
              style={{ fontSize: `${fontSize}px`, lineHeight: fontSize >= 72 ? 1.1 : 1.2 }}
            >
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
          <span className="hidden text-white/30 sm:inline">|</span>
          <span>Use LEFT/RIGHT for +/-5s</span>
          <span className="hidden text-white/30 sm:inline">|</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
