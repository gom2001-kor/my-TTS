import { useState, useEffect } from 'react';
import { Headphones, Sparkles, Mic } from 'lucide-react';
import { useTTS } from './hooks/useTTS';
import { useSpeechRecognition, calculateMatchPercentage } from './hooks/useSpeechRecognition';
import { TextInput } from './components/TextInput';
import { PlaybackControls } from './components/PlaybackControls';
import { AudioControls } from './components/AudioControls';
import { VoiceSelector } from './components/VoiceSelector';
import { PlayingIndicator } from './components/PlayingIndicator';
import { History } from './components/History';
import { PronunciationEval } from './components/PronunciationEval';

const HISTORY_KEY = 'tts-history';
const MAX_HISTORY = 10;

function App() {
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [matchPercentage, setMatchPercentage] = useState(null);

  const {
    voices,
    selectedVoice,
    setSelectedVoice,
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
  } = useTTS();

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    startListening,
    stopListening,
    clearTranscript,
  } = useSpeechRecognition();

  // Calculate match percentage when transcript changes
  useEffect(() => {
    if (transcript && text) {
      const percentage = calculateMatchPercentage(text, transcript);
      setMatchPercentage(percentage);
    }
  }, [transcript, text]);

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
    startListening();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/70 border-b border-indigo-100">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                영어 발음 학습
              </h1>
              <p className="text-xs text-gray-500">TTS와 발음 평가로 영어 실력 향상</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100 p-6 space-y-6 border border-indigo-50">
          {/* Text Input */}
          <TextInput text={text} setText={setText} />

          {/* Playing Indicator */}
          <PlayingIndicator isPlaying={isPlaying} isPaused={isPaused} />

          {/* Playback Controls */}
          <PlaybackControls
            isPlaying={isPlaying}
            isPaused={isPaused}
            repeatMode={repeatMode}
            onPlay={handlePlay}
            onPause={pause}
            onResume={resume}
            onStop={stop}
            onToggleRepeat={toggleRepeatMode}
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

          {/* Voice Selector */}
          <VoiceSelector
            voices={voices}
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
          />

          {/* Audio Controls */}
          <AudioControls
            rate={rate}
            setRate={setRate}
            pitch={pitch}
            setPitch={setPitch}
          />
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

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-xs text-gray-400">
            Web Speech API 기반 • Chrome, Edge 브라우저 권장
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
