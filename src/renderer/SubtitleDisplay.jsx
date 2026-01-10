export default function SubtitleDisplay({ subtitle, isActive = true }) {
  if (!subtitle) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-subtitle flex min-h-[clamp(70px,12vw,150px)] items-center justify-center rounded-[24px] border border-transparent px-6 py-5 text-center transition ${
        isActive ? 'bg-black/5 text-slate-800 shadow-inner' : 'bg-black/10 text-slate-500 opacity-70 italic'
      }`}
    >
      <div className="space-y-1 text-[clamp(18px,2.4vw,30px)] font-medium leading-relaxed">
        {subtitle.split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    </div>
  );
}
