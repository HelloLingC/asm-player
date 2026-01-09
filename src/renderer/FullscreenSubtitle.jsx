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
    <div className="fullscreen-subtitle-overlay" onClick={onClose}>
      <div className="fullscreen-subtitle-container" onClick={(e) => e.stopPropagation()}>
        <button className="fullscreen-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="fullscreen-info">
          <div className="fullscreen-status">
            {isPlaying ? '▶ Playing' : '⏸ Paused'}
          </div>
          {currentTrack >= 0 && (
            <div className="fullscreen-track-info">
              Track {currentTrack + 1}
            </div>
          )}
        </div>

        <div className="fullscreen-subtitle-content">
          {subtitle ? (
            <div className="fullscreen-subtitle-text">
              {subtitle.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          ) : (
            <div className="fullscreen-subtitle-placeholder">
              No subtitle at this moment
            </div>
          )}
        </div>

        <div className="fullscreen-controls-hint">
          <span>Press SPACE to play/pause</span>
          <span>•</span>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
