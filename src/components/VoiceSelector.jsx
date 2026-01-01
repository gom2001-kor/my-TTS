import { Volume2, Sparkles, Monitor } from 'lucide-react';

export function VoiceSelector({
    voices,
    selectedVoice,
    setSelectedVoice,
    // New props for engine toggle
    ttsEngine,
    setTtsEngine,
    openaiVoices,
    selectedOpenaiVoice,
    setSelectedOpenaiVoice,
    hasApiKey,
    onOpenSettings,
}) {
    const showEngineToggle = setTtsEngine !== undefined;

    return (
        <div className="space-y-4">
            {/* TTS Engine Toggle */}
            {showEngineToggle && (
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Volume2 className="w-4 h-4 text-indigo-500" />
                        음성 엔진
                    </label>

                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setTtsEngine('browser')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${ttsEngine === 'browser'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600'
                                }`}
                        >
                            <Monitor className="w-4 h-4" />
                            브라우저
                        </button>
                        <button
                            onClick={() => {
                                if (hasApiKey) {
                                    setTtsEngine('openai');
                                } else {
                                    onOpenSettings?.();
                                }
                            }}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${ttsEngine === 'openai'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-indigo-600'
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            OpenAI
                            {!hasApiKey && <span className="text-xs text-amber-500">🔑</span>}
                        </button>
                    </div>

                    {ttsEngine === 'openai' && !hasApiKey && (
                        <p className="text-xs text-amber-600">
                            ⚠️ OpenAI TTS를 사용하려면 API 키가 필요합니다.
                            <button
                                onClick={onOpenSettings}
                                className="ml-1 text-indigo-600 hover:underline"
                            >
                                설정하기
                            </button>
                        </p>
                    )}
                </div>
            )}

            {/* Voice Selection */}
            <div className="space-y-2">
                {showEngineToggle && (
                    <label className="text-sm font-medium text-gray-600">
                        {ttsEngine === 'browser' ? '브라우저 음성' : 'OpenAI 음성'}
                    </label>
                )}

                {!showEngineToggle && (
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Volume2 className="w-4 h-4 text-indigo-500" />
                        음성 선택
                    </label>
                )}

                {/* Browser Voice Selector */}
                {(!showEngineToggle || ttsEngine === 'browser') && (
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
                )}

                {/* OpenAI Voice Selector */}
                {showEngineToggle && ttsEngine === 'openai' && openaiVoices && (
                    <div className="grid grid-cols-2 gap-2">
                        {openaiVoices.map((voice) => (
                            <button
                                key={voice.id}
                                onClick={() => setSelectedOpenaiVoice(voice.id)}
                                className={`p-3 rounded-xl text-left transition-all ${selectedOpenaiVoice === voice.id
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                                    }`}
                            >
                                <p className="font-medium text-sm">{voice.name}</p>
                                <p className={`text-xs mt-0.5 ${selectedOpenaiVoice === voice.id ? 'text-indigo-100' : 'text-gray-500'
                                    }`}>
                                    {voice.description}
                                </p>
                            </button>
                        ))}
                    </div>
                )}

                {(!showEngineToggle || ttsEngine === 'browser') && voices.length === 0 && (
                    <p className="text-xs text-amber-600">
                        ⚠️ 영어 음성을 찾을 수 없습니다. 브라우저 설정을 확인해주세요.
                    </p>
                )}
            </div>
        </div>
    );
}
