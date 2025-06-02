
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('openai_api_key') || '';
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    const key = apiKey.trim();
    if (!key) {
      toast.error('Please enter an API key');
      return;
    }
    
    if (!key.startsWith('sk-')) {
      toast.error('Invalid API key format. It should start with "sk-"');
      return;
    }

    localStorage.setItem('openai_api_key', key);
    onSave(key);
    onClose();
    toast.success('API key saved successfully');
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    toast.success('API key cleared');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>OpenAI API Key Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-slate-300">
              API Key
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-slate-800 border-slate-700 text-white pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-slate-800 p-3 rounded border border-slate-700">
            <p className="text-sm text-slate-400 mb-2">Security Notice:</p>
            <p className="text-xs text-slate-500">
              Your API key is stored locally in your browser and never sent to any server except OpenAI.
              You can get an API key from{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                platform.openai.com
              </a>
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClear} className="border-slate-700 text-slate-400">
              Clear
            </Button>
            <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-400">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save API Key
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyModal;
