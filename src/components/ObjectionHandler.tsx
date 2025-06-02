
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Copy, RefreshCw, Target, Clock, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ObjectionData {
  text: string;
  category: string;
  subcategory: string;
  confidence: number;
}

interface ObjectionHandlerProps {
  lastObjection: ObjectionData | null;
  reply: string;
  confidence: number;
  isGenerating: boolean;
  onRegenerateReply: () => void;
}

const ObjectionHandler: React.FC<ObjectionHandlerProps> = ({
  lastObjection,
  reply,
  confidence,
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'budget': return <DollarSign className="w-4 h-4" />;
      case 'timing': return <Clock className="w-4 h-4" />;
      case 'competitor': return <Target className="w-4 h-4" />;
      case 'authority': return <Users className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'budget': return 'bg-red-100 text-red-800 border-red-200';
      case 'timing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'competitor': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'authority': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 8) return 'High Confidence';
    if (score >= 6) return 'Medium Confidence';
    return 'Low Confidence';
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
              onClick={() => copyToClipboard(lastObjection.text)}
              className="text-slate-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <p className="text-slate-300 bg-slate-800 p-3 rounded border border-slate-700">
              "{lastObjection.text}"
            </p>
            
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(lastObjection.category)}`}>
                {getCategoryIcon(lastObjection.category)}
                {lastObjection.category}
              </span>
              {lastObjection.subcategory && (
                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">
                  {lastObjection.subcategory}
                </span>
              )}
            </div>
          </div>
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

          {!isGenerating && reply && confidence > 0 && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Deal-Saver Confidence</span>
                <span className={`text-sm font-semibold ${getConfidenceColor(confidence)}`}>
                  {confidence}/10 - {getConfidenceLabel(confidence)}
                </span>
              </div>
              <Progress 
                value={confidence * 10} 
                className="h-2"
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ObjectionHandler;
