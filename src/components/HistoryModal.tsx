
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Trash2, Target, Clock, DollarSign, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ObjectionData {
  text: string;
  category: string;
  subcategory: string;
  confidence: number;
  timestamp: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ObjectionData[];
  onClearHistory: () => void;
  onReplayObjection: (objection: ObjectionData) => void;
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

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'budget': return <DollarSign className="w-3 h-3" />;
      case 'timing': return <Clock className="w-3 h-3" />;
      case 'competitor': return <Target className="w-3 h-3" />;
      case 'authority': return <Users className="w-3 h-3" />;
      default: return <AlertTriangle className="w-3 h-3" />;
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

  const getCategoryStats = () => {
    const stats: Record<string, number> = {};
    history.forEach(item => {
      stats[item.category] = (stats[item.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

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
        
        {history.length > 0 && (
          <div className="mb-4 p-3 bg-slate-800 rounded border border-slate-700">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Category Breakdown</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryStats).map(([category, count]) => (
                <span 
                  key={category}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(category)}`}
                >
                  {getCategoryIcon(category)}
                  {category} ({count})
                </span>
              ))}
            </div>
          </div>
        )}
        
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
                        {objection.timestamp || new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-2">"{objection.text}"</p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(objection.category)}`}>
                        {getCategoryIcon(objection.category)}
                        {objection.category}
                      </span>
                      {objection.subcategory && (
                        <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                          {objection.subcategory}
                        </span>
                      )}
                    </div>
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
                      onClick={() => copyToClipboard(objection.text)}
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
