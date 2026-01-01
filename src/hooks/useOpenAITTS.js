import { useState, useCallback, useRef } from 'react';

const OPENAI_VOICES = [
    { id: 'alloy', name: 'Alloy (중성)', description: '중성적이고 균형 잡힌 음성' },
    { id: 'echo', name: 'Echo (남성)', description: '부드러운 남성 음성' },
    { id: 'fable', name: 'Fable (남성)', description: '표현력 있는 영국식 남성 음성' },
    { id: 'onyx', name: 'Onyx (남성)', description: '깊고 권위 있는 남성 음성' },
    { id: 'nova', name: 'Nova (여성)', description: '따뜻하고 친근한 여성 음성' },
    { id: 'shimmer', name: 'Shimmer (여성)', description: '밝고 명랑한 여성 음성' },
];

export function useOpenAITTS(apiKey) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('nova');
    const [error, setError] = useState(null);

    const audioRef = useRef(null);
    const audioContextRef = useRef(null);
    const repeatModeRef = useRef(false);
    const currentTextRef = useRef('');

    const speak = useCallback(async (text, repeatMode = false) => {
        if (!text.trim()) return;
        if (!apiKey) {
            setError('OpenAI API 키가 설정되지 않았습니다.');
            return;
        }

        // Stop any current playback
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        setError(null);
        setIsPlaying(true);
        setIsPaused(false);
        currentTextRef.current = text;
        repeatModeRef.current = repeatMode;

        try {
            const response = await fetch('https://api.openai.com/v1/audio/speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'tts-1',
                    input: text,
                    voice: selectedVoice,
                    response_format: 'mp3',
                    speed: 1.0,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    throw new Error('API 키가 유효하지 않습니다.');
                } else if (response.status === 429) {
                    throw new Error('API 요청 한도를 초과했습니다.');
                } else {
                    throw new Error(errorData.error?.message || `API 오류: ${response.status}`);
                }
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                if (repeatModeRef.current && currentTextRef.current) {
                    // Repeat after a short delay
                    setTimeout(() => {
                        if (repeatModeRef.current) {
                            speak(currentTextRef.current, true);
                        }
                    }, 500);
                } else {
                    setIsPlaying(false);
                    setIsPaused(false);
                }
            };

            audio.onerror = () => {
                URL.revokeObjectURL(audioUrl);
                setError('오디오 재생 중 오류가 발생했습니다.');
                setIsPlaying(false);
                setIsPaused(false);
            };

            await audio.play();
        } catch (err) {
            console.error('OpenAI TTS error:', err);
            setError(err.message || 'TTS 변환에 실패했습니다.');
            setIsPlaying(false);
            setIsPaused(false);
        }
    }, [apiKey, selectedVoice]);

    const pause = useCallback(() => {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
            setIsPaused(true);
        }
    }, []);

    const resume = useCallback(() => {
        if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play();
            setIsPaused(false);
        }
    }, []);

    const stop = useCallback(() => {
        repeatModeRef.current = false;
        currentTextRef.current = '';
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    return {
        voices: OPENAI_VOICES,
        selectedVoice,
        setSelectedVoice,
        isPlaying,
        isPaused,
        error,
        speak,
        pause,
        resume,
        stop,
        setError,
    };
}

export { OPENAI_VOICES };
