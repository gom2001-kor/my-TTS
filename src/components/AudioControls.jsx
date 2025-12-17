import { Gauge, Music2 } from 'lucide-react';

export function AudioControls({ rate, setRate, pitch, setPitch }) {
    return (
        <div className="space-y-4">
            {/* Rate Control */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Gauge className="w-4 h-4 text-indigo-500" />
                        속도
                    </label>
                    <span className="px-2 py-0.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-md">
                        {rate.toFixed(1)}x
                    </span>
                </div>
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                    <span>0.5x (느리게)</span>
                    <span>1.0x</span>
                    <span>2.0x (빠르게)</span>
                </div>
            </div>

            {/* Pitch Control */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Music2 className="w-4 h-4 text-indigo-500" />
                        톤
                    </label>
                    <span className="px-2 py-0.5 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-md">
                        {pitch.toFixed(1)}
                    </span>
                </div>
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400">
                    <span>0.5 (낮게)</span>
                    <span>1.0</span>
                    <span>2.0 (높게)</span>
                </div>
            </div>
        </div>
    );
}
