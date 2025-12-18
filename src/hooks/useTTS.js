import { useState, useEffect, useCallback, useRef } from 'react';

export function useTTS() {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [rate, setRate] = useState(1.0);
    const [pitch, setPitch] = useState(1.0);
    const [repeatMode, setRepeatMode] = useState(false);

    const utteranceRef = useRef(null);
    const textRef = useRef('');

    // Load voices with smart initialization
    useEffect(() => {
        const loadVoices = () => {
            const allVoices = window.speechSynthesis.getVoices();
            // Filter for English voices only
            const englishVoices = allVoices.filter(
                voice => voice.lang.startsWith('en-US') || voice.lang.startsWith('en-GB') || voice.lang.startsWith('en_')
            );
            setVoices(englishVoices);

            // Smart voice initialization (only if no voice selected yet)
            if (englishVoices.length > 0 && !selectedVoice) {
                let voiceToSelect = null;

                // Priority 1: Check for saved user preference in localStorage
                const savedVoiceName = localStorage.getItem('preferredVoice');
                if (savedVoiceName) {
                    voiceToSelect = englishVoices.find(v => v.name === savedVoiceName);
                }

                // Priority 2: If no saved preference, look for Google en-US voice (Android optimization)
                if (!voiceToSelect) {
                    voiceToSelect = englishVoices.find(
                        v => v.name.includes('Google') && v.lang.startsWith('en-US')
                    );
                }

                // Priority 3: Fallback to first en-US voice (e.g., for iOS)
                if (!voiceToSelect) {
                    voiceToSelect = englishVoices.find(v => v.lang.startsWith('en-US'));
                }

                // Final fallback: just use the first available English voice
                if (!voiceToSelect) {
                    voiceToSelect = englishVoices[0];
                }

                setSelectedVoice(voiceToSelect);
            }
        };

        // Load voices immediately
        loadVoices();

        // Also handle async voice loading (Chrome)
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = useCallback((text) => {
        if (!text.trim()) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        textRef.current = text;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onstart = () => {
            setIsPlaying(true);
            setIsPaused(false);
        };

        utterance.onend = () => {
            if (repeatMode) {
                // Loop: restart speech after a short delay
                setTimeout(() => {
                    if (repeatMode && textRef.current) {
                        speak(textRef.current);
                    }
                }, 500);
            } else {
                setIsPlaying(false);
                setIsPaused(false);
            }
        };

        utterance.onerror = (event) => {
            if (event.error !== 'interrupted') {
                console.error('Speech error:', event.error);
            }
            setIsPlaying(false);
            setIsPaused(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [rate, pitch, selectedVoice, repeatMode]);

    const pause = useCallback(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    }, []);

    const resume = useCallback(() => {
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
    }, []);

    const stop = useCallback(() => {
        window.speechSynthesis.cancel();
        textRef.current = '';
        setIsPlaying(false);
        setIsPaused(false);
    }, []);

    const toggleRepeatMode = useCallback(() => {
        setRepeatMode(prev => !prev);
    }, []);

    // Wrapper function to save voice preference when user selects a voice
    const handleVoiceChange = useCallback((voice) => {
        if (voice && voice.name) {
            localStorage.setItem('preferredVoice', voice.name);
        }
        setSelectedVoice(voice);
    }, []);

    return {
        voices,
        selectedVoice,
        setSelectedVoice: handleVoiceChange,
        isPlaying,
        isPaused,
        rate,
        setRate,
        pitch,
        setPitch,
        repeatMode,
        toggleRepeatMode,
        speak,
        pause,
        resume,
        stop,
    };
}
