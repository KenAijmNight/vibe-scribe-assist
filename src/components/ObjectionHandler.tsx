
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ObjectionHandlerProps {
  lastObjection: string;
  reply: string;
  isGenerating: boolean;
  onRegenerateReply: () => void;
}

const ObjectionHandler: React.FC<ObjectionHandlerProps> = ({
  lastObjection,
  reply,
  isGenerating,
  onRegenerateReply
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  return (
    <div className="space-y-4">
      {lastObjection && (
        <Card className="p-4 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Last Objection</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(lastObjection)}
              className="text-slate-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-slate-300 bg-slate-800 p-3 rounded border border-slate-700">
            "{lastObjection}"
          </p>
        </Card>
      )}

      {(reply || isGenerating) && (
        <Card className="p-4 bg-slate-900 border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">AI Response</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRegenerateReply}
                disabled={isGenerating}
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </Button>
              {reply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reply)}
                  className="text-slate-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="bg-slate-800 p-3 rounded border border-slate-700 min-h-[80px]">
            {isGenerating ? (
              <div className="flex items-center gap-2 text-slate-400">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                Generating response...
              </div>
            ) : (
              <p className="text-slate-300 whitespace-pre-wrap">{reply}</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ObjectionHandler;
