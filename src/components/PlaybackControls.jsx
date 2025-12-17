import { Play, Pause, Square, Repeat } from 'lucide-react';

export function PlaybackControls({
    isPlaying,
    isPaused,
    repeatMode,
    onPlay,
    onPause,
    onResume,
    onStop,
    onToggleRepeat,
    disabled,
}) {
    return (
        <div className="flex items-center justify-center gap-3 flex-wrap">
            {/* Play / Pause Button */}
            {!isPlaying || isPaused ? (
                <button
                    onClick={isPaused ? onResume : onPlay}
                    disabled={disabled}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                    <Play className="w-5 h-5" fill="currentColor" />
                    {isPaused ? '이어듣기' : '듣기'}
                </button>
            ) : (
                <button
                    onClick={onPause}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                    <Pause className="w-5 h-5" fill="currentColor" />
                    일시정지
                </button>
            )}

            {/* Stop Button */}
            <button
                onClick={onStop}
                disabled={!isPlaying && !isPaused}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 shadow-md hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
                <Square className="w-5 h-5" fill="currentColor" />
                정지
            </button>

            {/* Repeat Mode Toggle */}
            <button
                onClick={onToggleRepeat}
                className={`flex items-center gap-2 px-4 py-3 font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${repeatMode
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-200'
                        : 'bg-white text-gray-600 border-2 border-gray-200 shadow-md hover:border-gray-300'
                    }`}
                title="반복 듣기 (쉐도잉)"
            >
                <Repeat className="w-5 h-5" />
                반복
            </button>
        </div>
    );
}
