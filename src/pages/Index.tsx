
import React, { useState, useEffect } from 'react';
import SpeechRecognition from '@/components/SpeechRecognition';
import ObjectionHandler from '@/components/ObjectionHandler';
import ApiKeyModal from '@/components/ApiKeyModal';
import HistoryModal from '@/components/HistoryModal';
import { toast } from 'sonner';

interface ObjectionData {
  text: string;
  category: string;
  subcategory: string;
  confidence: number;
  timestamp: string;
}

interface AIResponse {
  reply: string;
  confidence: number;
  category: string;
  subcategory: string;
}

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [lastObjection, setLastObjection] = useState<ObjectionData | null>(null);
  const [reply, setReply] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [objectionHistory, setObjectionHistory] = useState<ObjectionData[]>([]);

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

  const saveHistory = (history: ObjectionData[]) => {
    localStorage.setItem('objection_history', JSON.stringify(history));
  };

  const addToHistory = (objectionData: ObjectionData) => {
    const newHistory = [objectionData, ...objectionHistory.filter(item => item.text !== objectionData.text)].slice(0, 10);
    setObjectionHistory(newHistory);
    saveHistory(newHistory);
  };

  const generateReply = async (objectionText: string): Promise<AIResponse | null> => {
    if (!apiKey) {
      toast.error('Please set your OpenAI API key first');
      setShowApiKeyModal(true);
      return null;
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
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a sales expert helping to handle objections. Respond with JSON in this exact format:
{
  "reply": "Your professional response (under 150 words, conversational, acknowledge concern then provide value)",
  "confidence": 8,
  "category": "Budget|Timing|Competitor|Authority|Product|Other",
  "subcategory": "specific subcategory like 'Price too high', 'Need approval', 'Comparing alternatives', etc"
}

The confidence score (1-10) represents how likely this response is to save the deal and move the conversation forward. Consider factors like objection severity, response quality, and deal-saving potential.`
            },
            {
              role: 'user',
              content: `Customer objection: "${objectionText}"`
            }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate response');
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '{}';
      
      try {
        const parsed = JSON.parse(content);
        return {
          reply: parsed.reply || 'Sorry, I couldn\'t generate a response.',
          confidence: Math.max(1, Math.min(10, parsed.confidence || 5)),
          category: parsed.category || 'Other',
          subcategory: parsed.subcategory || 'General concern'
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return {
          reply: content,
          confidence: 5,
          category: 'Other',
          subcategory: 'General concern'
        };
      }
    } catch (error) {
      console.error('Error generating reply:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate response');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleObjection = async (objectionText: string) => {
    console.log('Objection detected:', objectionText);
    
    const aiResponse = await generateReply(objectionText);
    if (aiResponse) {
      const objectionData: ObjectionData = {
        text: objectionText,
        category: aiResponse.category,
        subcategory: aiResponse.subcategory,
        confidence: aiResponse.confidence,
        timestamp: new Date().toISOString()
      };
      
      setLastObjection(objectionData);
      setReply(aiResponse.reply);
      setConfidence(aiResponse.confidence);
      addToHistory(objectionData);
      toast.success('Objection detected and processed');
    }
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

  const replayObjection = async (objectionData: ObjectionData) => {
    setLastObjection(objectionData);
    const aiResponse = await generateReply(objectionData.text);
    if (aiResponse) {
      setReply(aiResponse.reply);
      setConfidence(aiResponse.confidence);
    }
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
            Live objection handling with AI-powered responses & insights
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
              confidence={confidence}
              isGenerating={isGenerating}
              onRegenerateReply={() => lastObjection && handleObjection(lastObjection.text)}
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
