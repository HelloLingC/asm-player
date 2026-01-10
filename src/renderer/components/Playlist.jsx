export default function Playlist({ tracks, currentTrackIndex, onSelectTrack }) {
  return (
    <div className="playlist-scroll max-h-[clamp(220px,40vh,360px)] space-y-3 overflow-y-auto rounded-[24px] bg-slate-100/60 p-4">
      {tracks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-slate-500">
          Your playlist is empty. Drop audio files to get started.
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
  );
}
