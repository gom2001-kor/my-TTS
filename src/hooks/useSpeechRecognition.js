import { useState, useCallback, useRef } from 'react';

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState(null);

    const recognitionRef = useRef(null);
    // Track which result indices we've already processed
    const processedResultIndexRef = useRef(0);

    const startListening = useCallback(() => {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 또는 Edge를 사용해주세요.');
            return;
        }

        // Clear previous state
        setError(null);
        setTranscript('');
        setInterimTranscript('');
        processedResultIndexRef.current = 0; // Reset processed index

        try {
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.lang = 'en-US'; // Recognize English speech
            recognition.continuous = true; // Keep listening until stopped
            recognition.interimResults = true; // Show partial results
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setIsListening(true);
                setError(null);
                processedResultIndexRef.current = 0;
            };

            recognition.onresult = (event) => {
                let newFinalText = '';
                let currentInterim = '';

                // IMPORTANT: Use event.resultIndex to only process NEW results
                // event.results contains ALL results from the session start
                // event.resultIndex tells us where the new results begin
                const startIndex = event.resultIndex;

                for (let i = startIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcriptText = result[0].transcript;

                    if (result.isFinal) {
                        // Only add final results that haven't been processed
                        if (i >= processedResultIndexRef.current) {
                            newFinalText += transcriptText + ' ';
                            processedResultIndexRef.current = i + 1;
                        }
                    } else {
                        // Interim results - always show the latest
                        currentInterim += transcriptText;
                    }
                }

                // Only update transcript if we have new final text
                if (newFinalText.trim()) {
                    setTranscript(prev => {
                        const combined = prev ? prev + ' ' + newFinalText.trim() : newFinalText.trim();
                        return combined.trim();
                    });
                }

                // Always update interim transcript
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
                        // Don't show error for no-speech, just let user try again
                        setError('음성이 감지되지 않았습니다. 마이크에 가까이 대고 다시 시도해주세요.');
                        break;
                    case 'network':
                        setError('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
                        setIsListening(false);
                        break;
                    case 'aborted':
                        // User stopped, not an error
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

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        clearTranscript,
    };
}

// Utility function to normalize text for comparison
export function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[.,!?;:'"()\-–—]/g, '') // Remove punctuation
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

// Calculate match percentage between two strings using Levenshtein distance
export function calculateMatchPercentage(original, spoken) {
    const normalizedOriginal = normalizeText(original);
    const normalizedSpoken = normalizeText(spoken);

    if (!normalizedOriginal || !normalizedSpoken) {
        return 0;
    }

    const originalWords = normalizedOriginal.split(' ');
    const spokenWords = normalizedSpoken.split(' ');

    // Count matching words (order-sensitive matching)
    let matchedCount = 0;

    // Try to match each spoken word to original words
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

    // Calculate percentage based on original text length
    const percentage = Math.round((matchedCount / originalWords.length) * 100);
    return Math.min(percentage, 100); // Cap at 100%
}
