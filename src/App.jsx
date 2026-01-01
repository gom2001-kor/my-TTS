import { useState, useEffect, useRef } from 'react';
import { Headphones, Sparkles, Mic, Settings as SettingsIcon, MessageCircle, BookOpen } from 'lucide-react';
import { useTTS } from './hooks/useTTS';
import { useSpeechRecognition, calculateMatchPercentage } from './hooks/useSpeechRecognition';
import { useAIChat } from './hooks/useAIChat';
import { useSettings } from './hooks/useSettings';
import { useOpenAITTS } from './hooks/useOpenAITTS';
import { TextInput } from './components/TextInput';
import { PlaybackControls } from './components/PlaybackControls';
import { AudioControls } from './components/AudioControls';
import { VoiceSelector } from './components/VoiceSelector';
import { PlayingIndicator } from './components/PlayingIndicator';
import { History } from './components/History';
import { PronunciationEval } from './components/PronunciationEval';
import { AIChat } from './components/AIChat';
import { Settings } from './components/Settings';

const HISTORY_KEY = 'tts-history';
const MAX_HISTORY = 10;
const TTS_ENGINE_KEY = 'tts-engine';

function App() {
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [matchPercentage, setMatchPercentage] = useState(null);
  const [mode, setMode] = useState('learning'); // 'learning' or 'chat'
  const [showSettings, setShowSettings] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [ttsEngine, setTtsEngine] = useState('browser'); // 'browser' or 'openai'

  const { settings, isLoaded, saveSettings } = useSettings();

  // Load TTS engine preference
  useEffect(() => {
    const saved = localStorage.getItem(TTS_ENGINE_KEY);
    if (saved) {
      setTtsEngine(saved);
    }
  }, []);

  // Save TTS engine preference
  const handleSetTtsEngine = (engine) => {
    setTtsEngine(engine);
    localStorage.setItem(TTS_ENGINE_KEY, engine);
  };

  // Browser TTS
  const {
    voices: browserVoices,
    selectedVoice: browserSelectedVoice,
    setSelectedVoice: setBrowserSelectedVoice,
    isPlaying: browserIsPlaying,
    isPaused: browserIsPaused,
    rate,
    setRate,
    pitch,
    setPitch,
    repeatMode: browserRepeatMode,
    toggleRepeatMode: browserToggleRepeatMode,
    speak: browserSpeak,
    pause: browserPause,
    resume: browserResume,
    stop: browserStop,
  } = useTTS();

  // OpenAI TTS
  const {
    voices: openaiVoices,
    selectedVoice: openaiSelectedVoice,
    setSelectedVoice: setOpenaiSelectedVoice,
    isPlaying: openaiIsPlaying,
    isPaused: openaiIsPaused,
    error: openaiTTSError,
    speak: openaiSpeak,
    pause: openaiPause,
    resume: openaiResume,
    stop: openaiStop,
  } = useOpenAITTS(settings.apiKey);

  // Unified TTS state based on engine
  const isPlaying = ttsEngine === 'openai' ? openaiIsPlaying : browserIsPlaying;
  const isPaused = ttsEngine === 'openai' ? openaiIsPaused : browserIsPaused;
  const repeatMode = browserRepeatMode; // Only browser supports repeat for now

  // Unified TTS functions
  const speak = (textToSpeak) => {
    if (ttsEngine === 'openai') {
      openaiSpeak(textToSpeak, repeatMode);
    } else {
      browserSpeak(textToSpeak);
    }
  };

  const pause = () => {
    if (ttsEngine === 'openai') {
      openaiPause();
    } else {
      browserPause();
    }
  };

  const resume = () => {
    if (ttsEngine === 'openai') {
      openaiResume();
    } else {
      browserResume();
    }
  };

  const stop = () => {
    openaiStop();
    browserStop();
  };

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();

  const {
    messages,
    isLoading: isChatLoading,
    error: chatError,
    sendMessage,
    clearMessages,
    setError: setChatError,
  } = useAIChat(settings.apiKey, settings.gptModel || 'gpt-4o-mini');

  const speakingCallbackRef = useRef(null);

  // Calculate match percentage when transcript changes (learning mode)
  useEffect(() => {
    if (mode === 'learning' && transcript && text) {
      const percentage = calculateMatchPercentage(text, transcript);
      setMatchPercentage(percentage);
    }
  }, [transcript, text, mode]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  // Add to history when playing
  const handlePlay = () => {
    if (!text.trim()) return;

    // Add to history (avoid duplicates at the top)
    const trimmedText = text.trim();
    const newHistory = [trimmedText, ...history.filter(h => h !== trimmedText)].slice(0, MAX_HISTORY);
    saveHistory(newHistory);

    speak(text);
  };

  const handleRestore = (item) => {
    setText(item);
    clearTranscript();
    setMatchPercentage(null);
  };

  const handleDelete = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    saveHistory(newHistory);
  };

  const handleClearHistory = () => {
    saveHistory([]);
  };

  const handleRetryPronunciation = () => {
    clearTranscript();
    setMatchPercentage(null);
  };

  const handleStartPronunciation = () => {
    // Stop TTS if playing
    if (isPlaying) {
      stop();
    }
    // Use English for pronunciation practice
    startListening('en-US');
  };

  // Chat mode handlers
  const handleSendChatMessage = async (messageText) => {
    setChatError(null);
    const response = await sendMessage(messageText);

    // Auto-play AI response if enabled
    if (response && settings.autoPlayResponse) {
      setPlayingMessageId(Date.now());
      speak(response);
    }
  };

  const handleSpeakMessage = (messageContent) => {
    if (isPlaying) {
      stop();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(Date.now());
      speak(messageContent);
    }
  };

  const handleStartChatListening = (lang = 'ko-KR') => {
    if (isPlaying) {
      stop();
    }
    clearTranscript();
    // Use the language selected by user in ChatInput
    startListening(lang);
  };

  // Handle mode switch - clear state
  const handleModeSwitch = (newMode) => {
    if (mode !== newMode) {
      // Stop any ongoing activities
      if (isPlaying) stop();
      if (isListening) stopListening();
      clearTranscript();
      setMatchPercentage(null);
      setMode(newMode);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-indigo-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  영어 발음 학습
                </h1>
                <p className="text-xs text-gray-500">TTS와 AI로 영어 실력 향상</p>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title="설정"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-1 mt-4 p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => handleModeSwitch('learning')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'learning'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
                }`}
            >
              <BookOpen className="w-4 h-4" />
              발음 학습
            </button>
            <button
              onClick={() => handleModeSwitch('chat')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'chat'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
                }`}
            >
              <MessageCircle className="w-4 h-4" />
              AI 대화
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {mode === 'learning' ? (
          <>
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100 p-6 space-y-6 border border-indigo-50">
              {/* Text Input */}
              <TextInput text={text} setText={setText} />

              {/* Playing Indicator */}
              <PlayingIndicator isPlaying={isPlaying} isPaused={isPaused} />

              {/* OpenAI TTS Error */}
              {ttsEngine === 'openai' && openaiTTSError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {openaiTTSError}
                </div>
              )}

              {/* Playback Controls */}
              <PlaybackControls
                isPlaying={isPlaying}
                isPaused={isPaused}
                repeatMode={repeatMode}
                onPlay={handlePlay}
                onPause={pause}
                onResume={resume}
                onStop={stop}
                onToggleRepeat={browserToggleRepeatMode}
                disabled={!text.trim()}
              />

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                <Mic className="w-4 h-4 text-rose-400" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
              </div>

              {/* Pronunciation Evaluation */}
              <PronunciationEval
                isListening={isListening}
                transcript={transcript}
                interimTranscript={interimTranscript}
                error={speechError}
                matchPercentage={matchPercentage}
                onStartListening={handleStartPronunciation}
                onStopListening={stopListening}
                onRetry={handleRetryPronunciation}
                disabled={!text.trim()}
              />

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
              </div>

              {/* Voice Selector with Engine Toggle */}
              <VoiceSelector
                voices={browserVoices}
                selectedVoice={browserSelectedVoice}
                setSelectedVoice={setBrowserSelectedVoice}
                ttsEngine={ttsEngine}
                setTtsEngine={handleSetTtsEngine}
                openaiVoices={openaiVoices}
                selectedOpenaiVoice={openaiSelectedVoice}
                setSelectedOpenaiVoice={setOpenaiSelectedVoice}
                hasApiKey={!!settings.apiKey}
                onOpenSettings={() => setShowSettings(true)}
              />

              {/* Audio Controls - only show for browser TTS */}
              {ttsEngine === 'browser' && (
                <AudioControls
                  rate={rate}
                  setRate={setRate}
                  pitch={pitch}
                  setPitch={setPitch}
                />
              )}
            </div>

            {/* History Card */}
            <div className="bg-white rounded-2xl shadow-lg shadow-indigo-50 p-6 border border-indigo-50">
              <History
                history={history}
                onRestore={handleRestore}
                onDelete={handleDelete}
                onClear={handleClearHistory}
              />
            </div>
          </>
        ) : (
          /* AI Chat Mode */
          <AIChat
            messages={messages}
            isLoading={isChatLoading}
            error={chatError}
            onSendMessage={handleSendChatMessage}
            onClearMessages={clearMessages}
            onSpeak={handleSpeakMessage}
            isPlaying={isPlaying}
            playingMessageId={playingMessageId}
            isListening={isListening}
            transcript={transcript}
            interimTranscript={interimTranscript}
            onStartListening={handleStartChatListening}
            onStopListening={stopListening}
            onClearTranscript={clearTranscript}
            voiceAutoSend={settings.voiceAutoSend}
            hasApiKey={!!settings.apiKey}
            onOpenSettings={() => setShowSettings(true)}
          />
        )}

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-xs text-gray-400">
            {ttsEngine === 'openai' ? 'OpenAI TTS API' : 'Web Speech API'} 기반 • Chrome, Edge 브라우저 권장
          </p>
        </footer>
      </main>

      {/* Settings Modal */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={saveSettings}
      />
    </div>
  );
}

export default App;
