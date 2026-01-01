import { useState, useEffect } from 'react';
import { X, Key, Volume2, Mic, Bot } from 'lucide-react';

const GPT_MODELS = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: '빠르고 경제적 (기본값)' },
    { id: 'gpt-4o', name: 'GPT-4o', description: '더 강력하고 정확함' },
];

export function Settings({
    isOpen,
    onClose,
    settings,
    onSaveSettings,
}) {
    const [apiKey, setApiKey] = useState(settings.apiKey || '');
    const [voiceAutoSend, setVoiceAutoSend] = useState(settings.voiceAutoSend ?? true);
    const [autoPlayResponse, setAutoPlayResponse] = useState(settings.autoPlayResponse ?? true);
    const [gptModel, setGptModel] = useState(settings.gptModel || 'gpt-4o-mini');
    const [showApiKey, setShowApiKey] = useState(false);

    // Sync local state when settings prop changes (e.g., after loading from localStorage)
    useEffect(() => {
        setApiKey(settings.apiKey || '');
        setVoiceAutoSend(settings.voiceAutoSend ?? true);
        setAutoPlayResponse(settings.autoPlayResponse ?? true);
        setGptModel(settings.gptModel || 'gpt-4o-mini');
    }, [settings]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSaveSettings({
            apiKey,
            voiceAutoSend,
            autoPlayResponse,
            gptModel,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 sticky top-0">
                    <h2 className="text-lg font-semibold text-gray-800">설정</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* API Key Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Key className="w-4 h-4 text-indigo-500" />
                            OpenAI API 키
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-..."
                                className="w-full px-4 py-3 pr-20 bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                            >
                                {showApiKey ? '숨기기' : '보기'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-400">
                            API 키는 브라우저에만 저장되며 서버로 전송되지 않습니다.
                        </p>
                    </div>

                    {/* GPT Model Selector */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <Bot className="w-4 h-4 text-indigo-500" />
                            GPT 모델
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {GPT_MODELS.map((model) => (
                                <button
                                    key={model.id}
                                    onClick={() => setGptModel(model.id)}
                                    className={`p-3 rounded-xl text-left transition-all ${gptModel === model.id
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-indigo-50'
                                        }`}
                                >
                                    <p className="font-medium text-sm">{model.name}</p>
                                    <p className={`text-xs mt-0.5 ${gptModel === model.id ? 'text-indigo-100' : 'text-gray-500'
                                        }`}>
                                        {model.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voice Auto-Send Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 rounded-lg">
                                <Mic className="w-4 h-4 text-rose-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">음성 자동 전송</p>
                                <p className="text-xs text-gray-400">말하기 끝나면 자동으로 메시지 전송</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setVoiceAutoSend(!voiceAutoSend)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${voiceAutoSend ? 'bg-indigo-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${voiceAutoSend ? 'left-7' : 'left-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Auto Play Response Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Volume2 className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">AI 응답 자동 재생</p>
                                <p className="text-xs text-gray-400">AI 응답을 음성으로 자동 재생</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setAutoPlayResponse(!autoPlayResponse)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${autoPlayResponse ? 'bg-indigo-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoPlayResponse ? 'left-7' : 'left-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-gray-600 font-medium bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2.5 text-white font-medium bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg shadow-indigo-200"
                    >
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
}
