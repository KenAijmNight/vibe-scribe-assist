
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface SpeechRecognitionProps {
  onObjection: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
  onShowSettings: () => void;
  onShowHistory: () => void;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  onObjection,
  isListening,
  onToggleListening,
  onShowSettings,
  onShowHistory
}) => {
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        const text = finalTranscript.trim();
        if (text && /[?]|too expensive|not sure|need more|but|however|concern|worried/i.test(text)) {
          onObjection(text);
        }
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
    };

    recognitionRef.current.onend = () => {
      if (isListening) {
        // Restart if we're supposed to be listening
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        }, 100);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, onObjection]);

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    } else if (!isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setTranscript('');
    }
  }, [isListening]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        onToggleListening();
      }
      if (e.code === 'KeyH' && e.altKey) {
        e.preventDefault();
        onShowHistory();
      }
      if (e.code === 'KeyK' && e.altKey) {
        e.preventDefault();
        onShowSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggleListening, onShowHistory, onShowSettings]);

  return (
    <Card className="p-6 bg-slate-900 border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Speech Recognition</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowHistory}
            className="text-slate-400 hover:text-white"
          >
            <History className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowSettings}
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="text-center mb-6">
        <Button
          onClick={onToggleListening}
          size="lg"
          className={`w-20 h-20 rounded-full transition-all duration-300 ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600'
          }`} />
          <span className="text-sm text-slate-400">
            {isListening ? 'Listening...' : 'Click to start listening'}
          </span>
        </div>

        {transcript && (
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <p className="text-slate-300 text-sm mb-1">Current transcript:</p>
            <p className="text-white">{transcript}</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500 space-y-1">
        <p>Keyboard shortcuts:</p>
        <p>• Spacebar: Toggle recording</p>
        <p>• Alt+H: Show history</p>
        <p>• Alt+K: API settings</p>
      </div>
    </Card>
  );
};

export default SpeechRecognition;
