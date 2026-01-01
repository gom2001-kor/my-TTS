import { Volume2 } from 'lucide-react';

export function ChatMessage({ message, onSpeak, isPlaying }) {
    const isUser = message.role === 'user';

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-br-md'
                        : 'bg-gray-100 text-gray-800 rounded-bl-md'
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

                <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className={`text-xs ${isUser ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {formatTime(message.timestamp)}
                    </span>

                    {/* Speaker button for AI messages */}
                    {!isUser && onSpeak && (
                        <button
                            onClick={() => onSpeak(message.content)}
                            className={`p-1 rounded-full transition-colors ${isPlaying
                                    ? 'bg-indigo-500 text-white'
                                    : 'hover:bg-gray-200 text-gray-500'
                                }`}
                            title="음성으로 듣기"
                        >
                            <Volume2 className={`w-4 h-4 ${isPlaying ? 'animate-pulse' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
