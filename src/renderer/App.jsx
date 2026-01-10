import { useState, useRef, useEffect, useCallback } from 'react';
import { parseSRT, getCurrentSubtitle } from '../utils/srtParser';
import SubtitleDisplay from './SubtitleDisplay';
import FullscreenSubtitle from './FullscreenSubtitle';
import PlaybackControls from './components/PlaybackControls';
import SubtitleControls from './components/SubtitleControls';
import Playlist from './components/Playlist';

const SEEK_INTERVAL_SECONDS = 5;

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

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const setAwake = window.electronAPI?.setFullscreenKeepAwake;
    if (!setAwake) {
      return undefined;
    }

    setAwake(isFullscreen);
    return () => setAwake(false);
  }, [isFullscreen]);

  const exitFullscreenMode = async () => {
    setIsFullscreen(false);
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error('Failed to exit fullscreen mode', error);
      }
    }
  };

  const handleSubtitleFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    const parsedSubtitles = parseSRT(text);
    setSubtitles(parsedSubtitles);
    setCurrentSubtitle(null);
  };

  const clearSubtitles = () => {
    setSubtitles([]);
    setCurrentSubtitle(null);
    exitFullscreenMode();
  };

  const toggleFullscreen = async () => {
    if (subtitles.length === 0) {
      alert('Please load a subtitle file first');
      return;
    }
    if (typeof document === 'undefined') {
      setIsFullscreen(true);
      return;
    }
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Failed to enter fullscreen mode', error);
        setIsFullscreen(true);
      }
    } else {
      await exitFullscreenMode();
    }
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;

    const audioFiles = Array.from(files).filter((file) => file.type?.startsWith('audio/'));
    const newTracks = audioFiles.map((file) => ({
      name: file.name,
      path: file.path || URL.createObjectURL(file),
    }));

    if (newTracks.length === 0) return;

    setPlaylist((prev) => {
      const updated = [...prev, ...newTracks];
      if (currentTrack === -1) {
        loadTrack(0, updated);
      }
      return updated;
    });
  };

  const loadTrack = useCallback(
    (index, playlistOverride) => {
      const list = playlistOverride ?? playlist;
      if (!list || index < 0 || index >= list.length) return;
      setCurrentTrack(index);
      if (audioRef.current) {
        audioRef.current.src = list[index].path;
        audioRef.current.load();
      }
    },
    [playlist],
  );

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (currentTrack === -1 && playlist.length > 0) {
      loadTrack(0);
    }
    audioRef.current?.play();
    setIsPlaying(true);
  }, [isPlaying, currentTrack, playlist, loadTrack]);

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

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const newProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(newProgress);

      const currentTime = audioRef.current.currentTime;
      const activeSubtitle = subtitles.find((sub) => currentTime >= sub.start && currentTime <= sub.end);
      const subtitle = getCurrentSubtitle(subtitles, currentTime);
      setCurrentSubtitle(subtitle);
      setIsCurrentActive(!!activeSubtitle);
    }
  };

  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const handleSeek = useCallback((offsetSeconds) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const duration = Number.isFinite(audio.duration) ? audio.duration : null;
    const currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    let nextTime = currentTime + offsetSeconds;

    if (duration !== null) {
      nextTime = Math.min(Math.max(nextTime, 0), duration);
    } else {
      nextTime = Math.max(nextTime, 0);
    }

    audio.currentTime = nextTime;

    if (duration && duration > 0) {
      setProgress((nextTime / duration) * 100);
    }
  }, []);

  const handleEnded = () => {
    if (currentTrack < playlist.length - 1) {
      loadTrack(currentTrack + 1);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    const handleGlobalKeyDown = (event) => {
      const target = event.target;
      const tagName = target?.tagName;
      const isEditable =
        target?.isContentEditable ||
        tagName === 'INPUT' ||
        tagName === 'TEXTAREA' ||
        tagName === 'SELECT';

      if (isEditable) {
        return;
      }

      if (event.code === 'Space' || event.key === ' ') {
        event.preventDefault();
        handlePlayPause();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleSeek(SEEK_INTERVAL_SECONDS);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handleSeek(-SEEK_INTERVAL_SECONDS);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handlePlayPause, handleSeek]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-indigo-500 via-indigo-500/90 to-purple-700 px-4 py-8 sm:px-8 lg:px-12">

      {isFullscreen && (
          <FullscreenSubtitle
            subtitle={currentSubtitle}
            onClose={exitFullscreenMode}
            isPlaying={isPlaying}
            currentTrack={currentTrack}
          />
        )}

      <div className="w-full max-w-[clamp(640px,70vw,1080px)] rounded-[clamp(20px,3vw,36px)] bg-white/95 p-6 text-slate-700 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur sm:p-8 lg:p-10">
       <div className="flex flex-col gap-6 text-[clamp(16px,1.4vw,20px)]">
          <audio
            ref={audioRef}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="hidden"
          />

          <PlaybackControls
            isPlaying={isPlaying}
            onPrev={handlePrev}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            progress={progress}
            onProgressChange={handleProgressChange}
          />

          <SubtitleDisplay subtitle={currentSubtitle} isActive={isCurrentActive} />

          <SubtitleControls
            hasSubtitles={subtitles.length > 0}
            onSubtitleSelected={handleSubtitleFile}
            onToggleFullscreen={toggleFullscreen}
            onClear={clearSubtitles}
          />

          <Playlist tracks={playlist} currentTrackIndex={currentTrack} onSelectTrack={loadTrack} onFilesSelected={handleFiles} />
        </div>
      </div>
    </div>
  );
}
