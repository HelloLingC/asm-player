import { useState, useRef } from 'react';
import { parseSRT, getCurrentSubtitle } from '../utils/srtParser';
import SubtitleDisplay from './SubtitleDisplay';
import FullscreenSubtitle from './FullscreenSubtitle';

const PROGRESS_FILL_COLOR = '#38ef7d';
const PROGRESS_REMAINING_COLOR = '#d9d9d9';

export default function App() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(-1);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(null);
  const [isCurrentActive, setIsCurrentActive] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropActive, setIsDropActive] = useState(false);
  const [isSubtitleDragOver, setIsSubtitleDragOver] = useState(false);
  const audioRef = useRef(null);

  // Handle subtitle file selection
  const handleSubtitleFile = async (file) => {
    const text = await file.text();
    const parsedSubtitles = parseSRT(text);
    setSubtitles(parsedSubtitles);
    setCurrentSubtitle(null);
  };

  const handleSubtitleClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.srt';
    input.onchange = (e) => {
      if (e.target.files[0]) {
        handleSubtitleFile(e.target.files[0]);
      }
    };
    input.click();
  };

  // Handle subtitle drag and drop
  const handleSubtitleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubtitleDragOver(true);
  };

  const handleSubtitleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubtitleDragOver(false);
  };

  const handleSubtitleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubtitleDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.srt')) {
        handleSubtitleFile(file);
      } else {
        alert('Please drop a .srt subtitle file');
      }
    }
  };

  const clearSubtitles = () => {
    setSubtitles([]);
    setCurrentSubtitle(null);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (subtitles.length === 0) {
      alert('Please load a subtitle file first');
      return;
    }
    setIsFullscreen(prev => !prev);
  };

  // Handle file selection
  const handleFiles = (files) => {
    const audioFiles = Array.from(files).filter(file => file.type.startsWith('audio/'));
    const newTracks = audioFiles.map(file => ({
      name: file.name,
      path: file.path || URL.createObjectURL(file)
    }));

    setPlaylist(prev => [...prev, ...newTracks]);

    if (currentTrack === -1 && newTracks.length > 0) {
      loadTrack(0, [...playlist, ...newTracks]);
    }
  };

  // Handle drop area click
  const handleDropAreaClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.multiple = true;
    input.onchange = (e) => handleFiles(e.target.files);
    input.click();
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDropActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDropActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDropActive(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  // Load track
  const loadTrack = (index, playlistToUse = playlist) => {
    if (index < 0 || index >= playlistToUse.length) return;
    setCurrentTrack(index);
    if (audioRef.current) {
      audioRef.current.src = playlistToUse[index].path;
      audioRef.current.load();
    }
  };

  // Playback controls
  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (currentTrack === -1 && playlist.length > 0) {
        loadTrack(0); 
      }
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentTrack > 0) {
      loadTrack(currentTrack - 1);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handleNext = () => {
    if (currentTrack < playlist.length - 1) {
      loadTrack(currentTrack + 1);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Progress bar
  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(newProgress);

      // Update current subtitle
      const currentTime = audioRef.current.currentTime;

      // Check if there's an active subtitle at current time
      const activeSubtitle = subtitles.find(
        sub => currentTime >= sub.start && currentTime <= sub.end
      );

      const subtitle = getCurrentSubtitle(subtitles, currentTime);
      setCurrentSubtitle(subtitle);
      setIsCurrentActive(!!activeSubtitle); // true if there's an active subtitle, false if showing last
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  // Auto play next track
  const handleEnded = () => {
    if (currentTrack < playlist.length - 1) {
      loadTrack(currentTrack + 1);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const progressBackground = `linear-gradient(90deg, ${PROGRESS_FILL_COLOR} 0%, ${PROGRESS_FILL_COLOR} ${progress}%, ${PROGRESS_REMAINING_COLOR} ${progress}%, ${PROGRESS_REMAINING_COLOR} 100%)`;
  const controlButtonClass =
    'flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl text-white shadow-lg transition duration-200 hover:scale-110 hover:shadow-xl active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:h-16 sm:w-16';
  const subtitleButtonBase =
    'inline-flex items-center justify-center gap-2 rounded-[20px] border border-transparent px-6 py-3 text-[clamp(14px,1.6vw,18px)] font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
  const dropAreaClasses = [
    'cursor-pointer select-none rounded-[28px] border-2 border-dashed px-6 py-[clamp(48px,6vw,80px)] text-center text-[clamp(18px,2vw,28px)] font-semibold leading-snug transition-all duration-200',
    isDropActive
      ? 'scale-[1.01] border-indigo-400 bg-indigo-50 text-indigo-500 shadow-xl'
      : 'border-slate-300 bg-white/70 text-slate-500 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-500',
  ].join(' ');

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-indigo-500/90 to-purple-700 px-4 py-8 sm:px-8 lg:px-12">
      <div className="w-full max-w-[clamp(640px,70vw,1080px)] rounded-[clamp(20px,3vw,36px)] bg-white/95 p-6 text-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 text-[clamp(16px,1.4vw,20px)]">
          <div
            role="button"
            tabIndex={0}
            className={dropAreaClasses}
            onClick={handleDropAreaClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDropAreaClick();
              }
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p>Drop audio files here</p>
            <p className="mt-2 text-base font-medium text-slate-500">or click to select</p>
          </div>

          <audio
            ref={audioRef}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="hidden"
          />

          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex min-w-[220px] flex-1 flex-wrap items-center gap-4">
              <button type="button" aria-label="Previous track" onClick={handlePrev} className={controlButtonClass}>
                ⏮
              </button>
              <button
                type="button"
                aria-label={isPlaying ? 'Pause' : 'Play'}
                onClick={handlePlayPause}
                className={controlButtonClass}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button type="button" aria-label="Next track" onClick={handleNext} className={controlButtonClass}>
                ⏭
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-full bg-slate-100/80 px-4 py-2 text-slate-600">
              <span aria-hidden="true" className="text-2xl">
                🔊
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
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
            onChange={handleProgressChange}
            style={{ background: progressBackground }}
            aria-label="Seek audio position"
            className="progress-slider w-full"
          />

          <SubtitleDisplay subtitle={currentSubtitle} isActive={isCurrentActive} />

          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            <button
              type="button"
              onClick={handleSubtitleClick}
              onDragOver={handleSubtitleDragOver}
              onDragLeave={handleSubtitleDragLeave}
              onDrop={handleSubtitleDrop}
              className={`${subtitleButtonBase} bg-gradient-to-br from-indigo-500 to-purple-600 ${
                isSubtitleDragOver ? 'scale-[1.03] border-indigo-200 shadow-2xl' : ''
              } focus-visible:outline-indigo-400`}
            >
              {subtitles.length > 0 ? '📝 Change Subtitle' : '📝 Load Subtitle'}
            </button>
            {subtitles.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className={`${subtitleButtonBase} bg-gradient-to-br from-emerald-500 to-lime-400 focus-visible:outline-emerald-300`}
                >
                  ⛶ Fullscreen
                </button>
                <button
                  type="button"
                  onClick={clearSubtitles}
                  className={`${subtitleButtonBase} bg-gradient-to-br from-pink-400 to-rose-500 focus-visible:outline-rose-400`}
                >
                  ✕ Clear
                </button>
              </>
            )}
          </div>

          {isFullscreen && (
            <FullscreenSubtitle
              subtitle={currentSubtitle}
              onClose={() => setIsFullscreen(false)}
              isPlaying={isPlaying}
              currentTrack={currentTrack}
              onPlayPause={handlePlayPause}
            />
          )}

          <div className="playlist-scroll max-h-[clamp(220px,40vh,360px)] space-y-3 overflow-y-auto rounded-[24px] bg-slate-100/60 p-4">
            {playlist.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-slate-500">
                Your playlist is empty. Drop audio files to get started.
              </div>
            )}
            {playlist.map((track, index) => {
              const isActive = index === currentTrack;
              return (
                <button
                  key={`${track.path || track.name}-${index}`}
                  type="button"
                  onClick={() => loadTrack(index)}
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
      </div>
    </div>
  );
}
