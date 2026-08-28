import React, { useEffect, useState } from 'react';
import { X, Download, Database, Trash2 } from 'lucide-react';
import { Photo, Video } from '../types';

interface SavedRanking {
  key: string;
  mediaType: string;
  query: string;
  itemCount: number;
  data: any[];
}

interface ExportRankingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportRankingsDrawer: React.FC<ExportRankingsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [savedRankings, setSavedRankings] = useState<SavedRanking[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadSavedRankings();
    }
  }, [isOpen]);

  const loadSavedRankings = () => {
    const rankings: SavedRanking[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('saved-payload-')) {
        try {
          const rawData = sessionStorage.getItem(key);
          if (rawData) {
            const data = JSON.parse(rawData);
            // key format: saved-payload-[mediaType]-[query]
            const parts = key.split('-');
            const mediaType = parts[2] || 'unknown';
            const query = parts.slice(3).join('-') || 'home';
            rankings.push({
              key,
              mediaType,
              query,
              itemCount: data.length,
              data
            });
          }
        } catch (e) {
          console.error('Failed to parse saved ranking:', key);
        }
      }
    }
    setSavedRankings(rankings);
  };

  const handleExportAll = () => {
    const exportData: Record<string, any> = {};
    savedRankings.forEach(ranking => {
      if (!exportData[ranking.mediaType]) {
        exportData[ranking.mediaType] = {};
      }
      exportData[ranking.mediaType][ranking.query] = ranking.data;
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visual-impact-rankings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (key: string) => {
    sessionStorage.removeItem(key);
    loadSavedRankings();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 border-l border-zinc-200 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-zinc-700" />
            <h2 className="text-sm font-bold text-zinc-900">Saved Rankings</h2>
            <span className="text-xs text-zinc-500 font-mono">({savedRankings.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedRankings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center mb-3">
                <Database className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">No saved rankings</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                Search for topics, rank the results, and click 'Save Ranking' to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleExportAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export All as JSON
              </button>

              <div className="pt-4 space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">
                  Saved Sessions
                </h3>
                {savedRankings.map((ranking) => (
                  <div
                    key={ranking.key}
                    className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-sm bg-zinc-100 text-zinc-600">
                          {ranking.mediaType}
                        </span>
                        <p className="text-sm font-bold text-zinc-900 capitalize truncate max-w-[200px]">
                          {ranking.query}
                        </p>
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {ranking.itemCount} Ranked Subjects
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(ranking.key)}
                      className="p-2 text-zinc-300 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                      title="Delete saved ranking"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
