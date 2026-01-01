import { useState, useCallback, useRef } from 'react';

export function useSpeechRecognition(lang = 'en-US') {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    // Track which result indices we've already processed
    const processedResultIndexRef = useRef(0);
    // Store the current language setting
    const currentLangRef = useRef(lang);

    const startListening = useCallback((overrideLang) => {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.');
            return;
        }

        // Use override language if provided, otherwise use default
        const recognitionLang = overrideLang || currentLangRef.current;

        // Clear previous state
        setError(null);
        setTranscript('');
        setInterimTranscript('');
        processedResultIndexRef.current = 0;

        try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.lang = recognitionLang;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
                processedResultIndexRef.current = 0;
            };

            recognition.onresult = (event) => {
                let newFinalText = '';
                let currentInterim = '';

                const startIndex = event.resultIndex;

                for (let i = startIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcriptText = result[0].transcript;

                    if (result.isFinal) {
                        if (i >= processedResultIndexRef.current) {
                            newFinalText += transcriptText + ' ';
                            processedResultIndexRef.current = i + 1;
                        }
                    } else {
                        currentInterim += transcriptText;
                    }
                }

                if (newFinalText.trim()) {
                    setTranscript(prev => {
                        const combined = prev ? prev + ' ' + newFinalText.trim() : newFinalText.trim();
                        return combined.trim();
                    });
                }

                setInterimTranscript(currentInterim);
            };

            recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);

                switch (event.error) {
                    case 'not-allowed':
                        setError('마이크 접근이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
                        setIsListening(false);
                        break;
                    case 'no-speech':
                        setError('음성이 감지되지 않았습니다. 마이크에 가까이 대고 다시 시도해주세요.');
                        break;
                    case 'network':
                        setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
                        setIsListening(false);
                        break;
                    case 'aborted':
                        break;
                    default:
                        setError(`음성 인식 오류: ${event.error}`);
                        setIsListening(false);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
                setInterimTranscript('');
            };

            recognition.start();
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
            setError('음성 인식을 시작할 수 없습니다. 브라우저 설정을 확인해주세요.');
            setIsListening(false);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            setInterimTranscript('');
        }
    }, []);

    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setError(null);
        processedResultIndexRef.current = 0;
    }, []);

    // Update the default language
    const setLanguage = useCallback((newLang) => {
        currentLangRef.current = newLang;
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        clearTranscript,
        setLanguage,
    };
}

// Utility function to normalize text for comparison
export function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[.,!?;:'"()\-–—]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Calculate match percentage between two strings
export function calculateMatchPercentage(original, spoken) {
    const normalizedOriginal = normalizeText(original);
    const normalizedSpoken = normalizeText(spoken);

    if (!normalizedOriginal || !normalizedSpoken) {
        return 0;
    }

    const originalWords = normalizedOriginal.split(' ');
    const spokenWords = normalizedSpoken.split(' ');

    let matchedCount = 0;
    const usedIndices = new Set();

    for (const spokenWord of spokenWords) {
        for (let i = 0; i < originalWords.length; i++) {
            if (!usedIndices.has(i) && originalWords[i] === spokenWord) {
                matchedCount++;
                usedIndices.add(i);
                break;
            }
        }
    }

    const percentage = Math.round((matchedCount / originalWords.length) * 100);
    return Math.min(percentage, 100);
}
