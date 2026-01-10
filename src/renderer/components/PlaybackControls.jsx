import { Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const CONTROL_BUTTON_CLASS =
  'flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transition duration-200 hover:scale-110 hover:shadow-xl active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:h-16 sm:w-16';
const CONTROL_ICON_CLASS = 'h-6 w-6 sm:h-7 sm:w-7';
const PROGRESS_FILL_COLOR = '#38ef7d';
const PROGRESS_REMAINING_COLOR = '#d9d9d9';

export default function PlaybackControls({
  isPlaying,
  onPrev,
  onPlayPause,
  onNext,
  volume,
  onVolumeChange,
  progress,
  onProgressChange,
}) {
  const progressBackground = `linear-gradient(90deg, ${PROGRESS_FILL_COLOR} 0%, ${PROGRESS_FILL_COLOR} ${progress}%, ${PROGRESS_REMAINING_COLOR} ${progress}%, ${PROGRESS_REMAINING_COLOR} 100%)`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex min-w-[220px] flex-1 flex-wrap items-center gap-4">
          <button type="button" aria-label="Previous track" onClick={onPrev} className={CONTROL_BUTTON_CLASS}>
            <SkipBack aria-hidden="true" className={CONTROL_ICON_CLASS} />
          </button>
          <button
            type="button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            onClick={onPlayPause}
            className={CONTROL_BUTTON_CLASS}
          >
            {isPlaying ? (
              <Pause aria-hidden="true" className={CONTROL_ICON_CLASS} />
            ) : (
              <Play aria-hidden="true" className={CONTROL_ICON_CLASS} />
            )}
          </button>
          <button type="button" aria-label="Next track" onClick={onNext} className={CONTROL_BUTTON_CLASS}>
            <SkipForward aria-hidden="true" className={CONTROL_ICON_CLASS} />
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-slate-100/80 px-4 py-2 text-slate-600">
          <Volume2 aria-hidden="true" className="h-6 w-6" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={onVolumeChange}
            aria-label="Adjust volume"
            className="range-slider w-32 sm:w-40"
          />
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={onProgressChange}
        style={{ background: progressBackground }}
        aria-label="Seek audio position"
        className="progress-slider w-full"
      />
    </>
  );
}
