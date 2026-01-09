export default function SubtitleDisplay({ subtitle, isActive = true }) {
  if (!subtitle) return null;

  return (
    <div className={`subtitle-display ${!isActive ? 'subtitle-inactive' : ''}`}>
      <div className="subtitle-text">
        {subtitle.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}
