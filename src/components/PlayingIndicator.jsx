export function PlayingIndicator({ isPlaying, isPaused }) {
    if (!isPlaying) return null;

    return (
        <div className="flex items-center justify-center gap-3 py-4">
            <div className="flex items-end gap-1 h-6">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-full ${isPaused ? 'h-1' : 'soundbar-animation'
                            }`}
                        style={{
                            animationDelay: `${i * 0.1}s`,
                        }}
                    />
                ))}
            </div>

            <span className={`text-sm font-medium ${isPaused ? 'text-amber-600' : 'text-indigo-600'}`}>
                {isPaused ? '일시정지' : '재생 중...'}
            </span>

            {!isPaused && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
        </div>
    );
}
