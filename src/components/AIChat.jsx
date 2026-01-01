import { useRef, useEffect } from 'react';
import { Trash2, AlertCircle, Bot } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function AIChat({
    messages,
    isLoading,
    error,
    onSendMessage,
    onClearMessages,
    onSpeak,
    isPlaying,
    playingMessageId,
    // Speech recognition props
    isListening,
    transcript,
    interimTranscript,
    onStartListening,
    onStopListening,
    onClearTranscript,
    voiceAutoSend,
    // API key check
    hasApiKey,
    onOpenSettings,
}) {
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] max-h-[600px] bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-indigo-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="font-semibold text-gray-700">AI 대화</h2>
                </div>

                {messages.length > 0 && (
                    <button
                        onClick={onClearMessages}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                        대화 초기화
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* API Key Warning */}
                {!hasApiKey && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-amber-800 font-medium">API 키가 설정되지 않았습니다</p>
                            <p className="text-xs text-amber-600 mt-1">
                                AI 대화를 사용하려면 OpenAI API 키가 필요합니다.
                            </p>
                            <button
                                onClick={onOpenSettings}
                                className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 underline"
                            >
                                설정에서 API 키 입력하기
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {messages.length === 0 && hasApiKey && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full mb-4">
                            <Bot className="w-8 h-8 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-700 mb-2">AI와 대화해 보세요!</h3>
                        <p className="text-sm text-gray-500 max-w-xs">
                            마이크 버튼을 눌러 음성으로 말하거나,<br />
                            텍스트를 입력해서 대화를 시작하세요.
                        </p>
                    </div>
                )}

                {/* Message List */}
                {messages.map((message, index) => (
                    <ChatMessage
                        key={message.timestamp || index}
                        message={message}
                        onSpeak={message.role === 'assistant' ? onSpeak : null}
                        isPlaying={isPlaying && playingMessageId === message.timestamp}
                    />
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: `${i * 0.15}s` }}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">AI가 생각 중...</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <ChatInput
                onSend={onSendMessage}
                disabled={!hasApiKey || isLoading}
                isListening={isListening}
                transcript={transcript}
                interimTranscript={interimTranscript}
                onStartListening={onStartListening}
                onStopListening={onStopListening}
                onClearTranscript={onClearTranscript}
                voiceAutoSend={voiceAutoSend}
            />
        </div>
    );
}
