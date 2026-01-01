import { useState, useEffect, useCallback } from 'react';

const SETTINGS_KEY = 'tts-app-settings';

const defaultSettings = {
    voiceAutoSend: true,
    apiKey: '',
    autoPlayResponse: true, // AI 응답 자동 재생
    chatLanguage: 'auto', // 'en', 'ko', 'auto'
    gptModel: 'gpt-4o-mini', // 'gpt-4o-mini' or 'gpt-4o'
};

export function useSettings() {
    const [settings, setSettings] = useState(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load settings from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSettings({ ...defaultSettings, ...parsed });
            } catch (e) {
                console.error('Failed to parse settings:', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save settings to localStorage
    const saveSettings = useCallback((newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }, [settings]);

    // Individual setters for convenience
    const setVoiceAutoSend = useCallback((value) => {
        saveSettings({ voiceAutoSend: value });
    }, [saveSettings]);

    const setApiKey = useCallback((value) => {
        saveSettings({ apiKey: value });
    }, [saveSettings]);

    const setAutoPlayResponse = useCallback((value) => {
        saveSettings({ autoPlayResponse: value });
    }, [saveSettings]);

    const setChatLanguage = useCallback((value) => {
        saveSettings({ chatLanguage: value });
    }, [saveSettings]);

    const setGptModel = useCallback((value) => {
        saveSettings({ gptModel: value });
    }, [saveSettings]);

    return {
        settings,
        isLoaded,
        saveSettings,
        setVoiceAutoSend,
        setApiKey,
        setAutoPlayResponse,
        setChatLanguage,
        setGptModel,
    };
}
