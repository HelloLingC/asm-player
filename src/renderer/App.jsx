import { useState, useRef } from 'react';
import '../styles.css';
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
    e.currentTarget.classList.add('subtitle-btn-drag-over');
  };

  const handleSubtitleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('subtitle-btn-drag-over');
  };

  const handleSubtitleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('subtitle-btn-drag-over');

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
    e.currentTarget.style.borderColor = '#4CAF50';
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.borderColor = '#ccc';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#ccc';
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

  return (
    <div className="player">
      <div
        className="drop-area"
        onClick={handleDropAreaClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        Drop audio files here or click to select
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      <div className="controls">
        <button onClick={handlePrev}>⏮</button>
        <button onClick={handlePlayPause}>{isPlaying ? '⏸' : '▶'}</button>
        {/* <button onClick={handleStop}>⏹</button> */}
        <button onClick={handleNext}>⏭</button>

        <div className="volume">
          <span>🔊</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>

      <input
        type="range"
        className="progress"
        min="0"
        max="100"
        value={progress}
        onChange={handleProgressChange}
        style={{ background: progressBackground }}
      />

      <SubtitleDisplay subtitle={currentSubtitle} isActive={isCurrentActive} />

      <div className="subtitle-controls">
        <button
          onClick={handleSubtitleClick}
          onDragOver={handleSubtitleDragOver}
          onDragLeave={handleSubtitleDragLeave}
          onDrop={handleSubtitleDrop}
          className="subtitle-btn"
        >
          {subtitles.length > 0 ? '📝 Change Subtitle' : '📝 Load Subtitle'}
        </button>
        {subtitles.length > 0 && (
          <>
            <button onClick={toggleFullscreen} className="subtitle-btn fullscreen-btn">
              ⛶ Fullscreen
            </button>
            <button onClick={clearSubtitles} className="subtitle-btn clear-btn">
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

      <div className="playlist">
        {playlist.map((track, index) => (
          <div
            key={index}
            className={`playlist-item ${index === currentTrack ? 'active' : ''}`}
            onClick={() => loadTrack(index)}
          >
            {track.name}
          </div>
        ))}
      </div>
    </div>
  );
}
