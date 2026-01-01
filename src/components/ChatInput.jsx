import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, Globe } from 'lucide-react';

const SPEECH_LANGUAGES = [
    { code: 'ko-KR', label: '🇰🇷 한국어', short: '한' },
    { code: 'en-US', label: '🇺🇸 English', short: 'EN' },
];

export function ChatInput({
    onSend,
    disabled,
    isListening,
    transcript,
    interimTranscript,
    onStartListening,
    onStopListening,
    voiceAutoSend,
    onClearTranscript,
}) {
    const [inputText, setInputText] = useState('');
    const [speechLang, setSpeechLang] = useState('ko-KR'); // Default to Korean
    const [showLangMenu, setShowLangMenu] = useState(false);
    const inputRef = useRef(null);

    // Track if we already sent the current transcript to prevent duplicates
    const sentTranscriptRef = useRef('');
    // Track previous isListening state to detect when listening stops
    const wasListeningRef = useRef(false);

    // Sync transcript to input field when voice recognition is active
    useEffect(() => {
        if (isListening) {
            // Combine final transcript with interim for display
            const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');
            setInputText(displayText.trim());
        }
    }, [transcript, interimTranscript, isListening]);

    // Auto-send when voice recognition stops and voiceAutoSend is enabled
    useEffect(() => {
        // Detect transition from listening=true to listening=false
        const justStoppedListening = wasListeningRef.current && !isListening;
        wasListeningRef.current = isListening;

        if (justStoppedListening && transcript.trim()) {
            // Check if we haven't already sent this exact transcript
            if (sentTranscriptRef.current !== transcript.trim()) {
                if (voiceAutoSend) {
                    sentTranscriptRef.current = transcript.trim();
                    handleSendInternal(transcript.trim());
                }
            }
        }
    }, [isListening, transcript, voiceAutoSend]);

    const handleSendInternal = useCallback((textToSend) => {
        const text = textToSend.trim();
        if (!text || disabled) return;

        onSend(text);
        setInputText('');
        sentTranscriptRef.current = text; // Mark as sent

        // Clear transcript after sending
        if (onClearTranscript) {
            onClearTranscript();
        }
    }, [disabled, onSend, onClearTranscript]);

    const handleSend = useCallback(() => {
        const text = inputText.trim();
        if (!text || disabled) return;

        onSend(text);
        setInputText('');
        sentTranscriptRef.current = text;

        if (onClearTranscript) {
            onClearTranscript();
        }
    }, [inputText, disabled, onSend, onClearTranscript]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            onStopListening();
        } else {
            // Reset state when starting new recording
            setInputText('');
            sentTranscriptRef.current = '';
            if (onClearTranscript) {
                onClearTranscript();
            }
            // Pass the selected language to the listening function
            onStartListening(speechLang);
        }
    };

    const handleLangSelect = (langCode) => {
        setSpeechLang(langCode);
        setShowLangMenu(false);
    };

    const currentLang = SPEECH_LANGUAGES.find(l => l.code === speechLang) || SPEECH_LANGUAGES[0];

    return (
        <div className="border-t border-gray-200 bg-white p-4">
            {/* Listening Indicator */}
            {isListening && (
                <div className="flex items-center justify-center gap-2 mb-3 py-2 bg-rose-50 rounded-lg">
                    <div className="listening-wave">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="wave-bar"
                                style={{ animationDelay: `${i * 0.1}s` }}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-rose-600 font-medium">
                        듣는 중... ({currentLang.label})
                    </span>
                </div>
            )}

            {/* Input Area */}
            <div className="flex items-end gap-2">
                {/* Language Selector */}
                <div className="relative">
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        disabled={isListening}
                        className={`flex-shrink-0 px-2.5 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${isListening
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                            }`}
                        title="음성 인식 언어 선택"
                    >
                        {currentLang.short}
                    </button>

                    {/* Language Dropdown */}
                    {showLangMenu && !isListening && (
                        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-10">
                            {SPEECH_LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLangSelect(lang.code)}
                                    className={`w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 transition-colors ${speechLang === lang.code ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mic Button */}
                <button
                    onClick={handleMicClick}
                    className={`flex-shrink-0 p-3 rounded-xl transition-all duration-200 ${isListening
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200 animate-pulse'
                        : 'bg-gray-100 text-gray-600 hover:bg-rose-100 hover:text-rose-500'
                        }`}
                    title={isListening ? '녹음 중지' : '음성으로 입력'}
                >
                    {isListening ? (
                        <MicOff className="w-5 h-5" />
                    ) : (
                        <Mic className="w-5 h-5" />
                    )}
                </button>

                {/* Text Input */}
                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isListening ? '말씀해 주세요...' : '메시지를 입력하세요...'}
                        disabled={disabled || isListening}
                        className="w-full px-4 py-3 pr-12 bg-gray-100 border-0 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all disabled:opacity-50"
                        rows={1}
                        style={{ minHeight: '48px', maxHeight: '120px' }}
                    />
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || disabled || isListening}
                    className="flex-shrink-0 p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
                    title="전송"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>

            {/* Voice Auto-Send Hint */}
            {isListening && voiceAutoSend && (
                <p className="text-xs text-center text-gray-400 mt-2">
                    말하기를 멈추면 자동으로 전송됩니다
                </p>
            )}
        </div>
    );
}
