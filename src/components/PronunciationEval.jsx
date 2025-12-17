import { Mic, MicOff, AlertCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export function PronunciationEval({
    isListening,
    transcript,
    interimTranscript,
    error,
    matchPercentage,
    onStartListening,
    onStopListening,
    onRetry,
    disabled,
}) {
    const getScoreColor = () => {
        if (matchPercentage >= 80) return 'text-green-600';
        if (matchPercentage >= 50) return 'text-yellow-600';
        return 'text-red-500';
    };

    const getScoreBgColor = () => {
        if (matchPercentage >= 80) return 'bg-green-50 border-green-200';
        if (matchPercentage >= 50) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const getFeedback = () => {
        if (matchPercentage >= 90) return { icon: CheckCircle, text: '완벽해요! 🎉', color: 'text-green-600' };
        if (matchPercentage >= 80) return { icon: CheckCircle, text: '훌륭해요! 👏', color: 'text-green-600' };
        if (matchPercentage >= 60) return { icon: AlertCircle, text: '좋아요! 조금만 더 연습해보세요 💪', color: 'text-yellow-600' };
        if (matchPercentage >= 40) return { icon: XCircle, text: '다시 한번 시도해보세요 🔄', color: 'text-orange-500' };
        return { icon: XCircle, text: '천천히 다시 말해보세요 📖', color: 'text-red-500' };
    };

    const hasResult = transcript && !isListening;

    return (
        <div className="space-y-4">
            {/* Microphone Button */}
            <div className="flex items-center justify-center gap-3">
                {!isListening ? (
                    <button
                        onClick={onStartListening}
                        disabled={disabled}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        <Mic className="w-5 h-5" />
                        발음 테스트
                    </button>
                ) : (
                    <button
                        onClick={onStopListening}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 transition-all duration-200"
                    >
                        <MicOff className="w-5 h-5 animate-pulse" />
                        녹음 중지
                    </button>
                )}
            </div>

            {/* Listening Indicator with realtime transcript */}
            {isListening && (
                <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center gap-1">
                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }}
                                />
                            ))}
                        </div>
                        <span className="text-rose-600 font-medium text-sm">마이크에 영어로 말해주세요...</span>
                    </div>

                    {/* Show what's being heard in real-time */}
                    {(transcript || interimTranscript) && (
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">인식 중:</p>
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">{transcript}</span>
                                {interimTranscript && (
                                    <span className="text-gray-400 italic"> {interimTranscript}</span>
                                )}
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-center text-gray-500">
                        말하기가 끝나면 &apos;녹음 중지&apos; 버튼을 눌러주세요
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && !isListening && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700">{error}</p>
                        <button
                            onClick={onRetry}
                            className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                        >
                            다시 시도하기
                        </button>
                    </div>
                </div>
            )}

            {/* Result Display */}
            {hasResult && matchPercentage !== null && (
                <div className={`p-4 rounded-xl border-2 ${getScoreBgColor()} space-y-3`}>
                    {/* Score */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">정확도</span>
                        <span className={`text-3xl font-bold ${getScoreColor()}`}>
                            {matchPercentage}%
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${matchPercentage >= 80
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                    : matchPercentage >= 50
                                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                                        : 'bg-gradient-to-r from-red-400 to-rose-500'
                                }`}
                            style={{ width: `${matchPercentage}%` }}
                        />
                    </div>

                    {/* Feedback Message */}
                    {(() => {
                        const feedback = getFeedback();
                        const Icon = feedback.icon;
                        return (
                            <div className={`flex items-center gap-2 ${feedback.color}`}>
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{feedback.text}</span>
                            </div>
                        );
                    })()}

                    {/* Spoken Text */}
                    <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">인식된 발음:</p>
                        <p className="text-sm text-gray-700 italic">&quot;{transcript}&quot;</p>
                    </div>

                    {/* Retry Button */}
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        다시 시도
                    </button>
                </div>
            )}
        </div>
    );
}
