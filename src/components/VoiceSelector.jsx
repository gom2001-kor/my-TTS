import { Volume2 } from 'lucide-react';

export function VoiceSelector({ voices, selectedVoice, setSelectedVoice }) {
    return (
        <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                음성 선택
            </label>

            <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                    const voice = voices.find(v => v.name === e.target.value);
                    setSelectedVoice(voice);
                }}
                className="w-full px-4 py-3 text-gray-700 bg-white border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer transition-all duration-200 appearance-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '20px',
                }}
            >
                {voices.length === 0 ? (
                    <option value="">음성 로딩 중...</option>
                ) : (
                    voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                        </option>
                    ))
                )}
            </select>

            {voices.length === 0 && (
                <p className="text-xs text-amber-600">
                    ⚠️ 영어 음성을 찾을 수 없습니다. 브라우저 설정을 확인해주세요.
                </p>
            )}
        </div>
    );
}
