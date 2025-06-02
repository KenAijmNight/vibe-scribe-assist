
import React, { useState, useEffect } from 'react';
import SpeechRecognition from '@/components/SpeechRecognition';
import ObjectionHandler from '@/components/ObjectionHandler';
import ApiKeyModal from '@/components/ApiKeyModal';
import HistoryModal from '@/components/HistoryModal';
import { toast } from 'sonner';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastObjection, setLastObjection] = useState('');
  const [reply, setReply] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [objectionHistory, setObjectionHistory] = useState<string[]>([]);

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key') || '';
    setApiKey(savedKey);
    
    // Load history from localStorage
    const savedHistory = localStorage.getItem('objection_history');
    if (savedHistory) {
      try {
        setObjectionHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }

    // Prompt for API key if not available
    if (!savedKey) {
      setTimeout(() => setShowApiKeyModal(true), 1000);
    }

    // Update document title based on listening state
    document.title = isListening ? '🎤 Listening - Transcribe n Vibe' : 'Transcribe n Vibe';
  }, [isListening]);

  const saveHistory = (history: string[]) => {
    localStorage.setItem('objection_history', JSON.stringify(history));
  };

  const addToHistory = (objection: string) => {
    const newHistory = [objection, ...objectionHistory.filter(item => item !== objection)].slice(0, 10);
    setObjectionHistory(newHistory);
    saveHistory(newHistory);
  };

  const generateReply = async (objection: string) => {
    if (!apiKey) {
      toast.error('Please set your OpenAI API key first');
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a sales expert helping to handle objections. Your job is to provide professional, empathetic, and persuasive responses to customer objections. Keep responses conversational, under 150 words, and focus on addressing the concern while moving the conversation forward. Always acknowledge the concern first, then provide value or reassurance.`
            },
            {
              role: 'user',
              content: `Customer objection: "${objection}"\n\nProvide a professional response that acknowledges their concern and offers a solution or reassurance.`
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate response');
      }

      const data = await response.json();
      const generatedReply = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
      setReply(generatedReply);
      toast.success('Response generated successfully');
    } catch (error) {
      console.error('Error generating reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate response');
      setReply('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleObjection = (objection: string) => {
    console.log('Objection detected:', objection);
    setLastObjection(objection);
    addToHistory(objection);
    generateReply(objection);
    toast.success('Objection detected and processing response');
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast.success('Started listening for objections');
    } else {
      toast.info('Stopped listening');
    }
  };

  const handleApiKeySave = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  const clearHistory = () => {
    setObjectionHistory([]);
    saveHistory([]);
    toast.success('History cleared');
  };

  const replayObjection = (objection: string) => {
    setLastObjection(objection);
    generateReply(objection);
    setShowHistoryModal(false);
    toast.success('Replaying objection');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Transcribe n Vibe
          </h1>
          <p className="text-slate-400">
            Live objection handling with AI-powered responses
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Speech Recognition Panel */}
          <div>
            <SpeechRecognition
              onObjection={handleObjection}
              isListening={isListening}
              onToggleListening={toggleListening}
              onShowSettings={() => setShowApiKeyModal(true)}
              onShowHistory={() => setShowHistoryModal(true)}
            />
          </div>

          {/* Objection Handler Panel */}
          <div>
            <ObjectionHandler
              lastObjection={lastObjection}
              reply={reply}
              isGenerating={isGenerating}
              onRegenerateReply={() => lastObjection && generateReply(lastObjection)}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-4 bg-slate-800 px-6 py-3 rounded-full border border-slate-700">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-slate-400">
                API Key: {apiKey ? 'Connected' : 'Not Set'}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-blue-500 animate-pulse' : 'bg-slate-600'}`} />
              <span className="text-sm text-slate-400">
                {isListening ? 'Listening' : 'Standby'}
              </span>
            </div>
            <div className="w-px h-4 bg-slate-600" />
            <span className="text-sm text-slate-400">
              History: {objectionHistory.length} items
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
      />

      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={objectionHistory}
        onClearHistory={clearHistory}
        onReplayObjection={replayObjection}
      />
    </div>
  );
};

export default Index;
