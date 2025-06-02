
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: string[];
  onClearHistory: () => void;
  onReplayObjection: (objection: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
  onReplayObjection
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Objection History</DialogTitle>
            {history.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearHistory}
                className="border-slate-700 text-slate-400 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No objections recorded yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Start listening to capture objections and questions
              </p>
            </div>
          ) : (
            history.map((objection, index) => (
              <Card key={index} className="p-4 bg-slate-800 border-slate-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-slate-500">#{history.length - index}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300">"{objection}"</p>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReplayObjection(objection)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Replay
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(objection)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;
