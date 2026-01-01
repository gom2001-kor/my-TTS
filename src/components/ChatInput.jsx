import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

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
    const inputRef = useRef(null);
    const hasSentRef = useRef(false);
    const lastTranscriptRef = useRef('');

    // Sync transcript to input field when voice recognition is active
    useEffect(() => {
        if (isListening) {
            // Only use the final transcript, show interim as preview
            const displayText = transcript + (interimTranscript ? ` ${interimTranscript}` : '');
            setInputText(displayText.trim());
            hasSentRef.current = false; // Reset sent flag when listening
        }
    }, [transcript, interimTranscript, isListening]);

    // Auto-send when voice recognition stops and voiceAutoSend is enabled
    useEffect(() => {
        // Only trigger when isListening changes from true to false
        if (!isListening && lastTranscriptRef.current !== transcript && transcript.trim() && !hasSentRef.current) {
            // Voice recognition just stopped with a final transcript
            if (voiceAutoSend) {
                hasSentRef.current = true;
                handleSend(transcript.trim());
            }
        }
        lastTranscriptRef.current = transcript;
    }, [isListening, transcript, voiceAutoSend]);

    const handleSend = useCallback((textToSend) => {
        const text = (textToSend || inputText).trim();
        if (!text || disabled) return;

        onSend(text);
        setInputText('');
        hasSentRef.current = true;

        // Clear transcript after sending
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
            setInputText('');
            hasSentRef.current = false;
            if (onClearTranscript) {
                onClearTranscript();
            }
            onStartListening();
        }
    };

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
                    <span className="text-sm text-rose-600 font-medium">듣는 중...</span>
                </div>
            )}

            {/* Input Area */}
            <div className="flex items-end gap-2">
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
                    onClick={() => handleSend()}
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
