import React, { useEffect, useState } from 'react';
import { X, Download, Database, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface SavedRanking {
  key: string;
  mediaType: string;
  query: string;
  itemCount: number;
  data: any[];
}

interface ExportRankingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportRankingsModal: React.FC<ExportRankingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [savedRankings, setSavedRankings] = useState<SavedRanking[]>([]);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedRankings();
      setExpandedKey(null);
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

  const handleDelete = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    sessionStorage.removeItem(key);
    if (expandedKey === key) {
      setExpandedKey(null);
    }
    loadSavedRankings();
  };

  const toggleExpand = (key: string) => {
    setExpandedKey(prev => prev === key ? null : key);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white max-h-[85vh] rounded-2xl shadow-2xl flex flex-col z-50 animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
              <Database className="w-5 h-5 text-zinc-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900">Saved Rankings</h2>
                <span className="text-xs text-zinc-500 font-mono bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                  {savedRankings.length}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">Evaluate and export your session preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {savedRankings.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-zinc-400">
              <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 mb-1">No saved rankings</p>
              <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                Search for topics, rank the results, and click 'Save Ranking' to evaluate them here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={handleExportAll}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                Export All as JSON
              </button>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1 border-b border-zinc-100 pb-2">
                  Saved Sessions
                </h3>
                {savedRankings.map((ranking) => {
                  const isExpanded = expandedKey === ranking.key;
                  return (
                    <div
                      key={ranking.key}
                      className="rounded-xl border border-zinc-200 bg-white overflow-hidden transition-all duration-200"
                    >
                      {/* Accordion Header */}
                      <div 
                        onClick={() => toggleExpand(ranking.key)}
                        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 transition-colors ${isExpanded ? 'bg-zinc-50 border-b border-zinc-100' : ''}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${isExpanded ? 'bg-zinc-200' : 'bg-zinc-100'} transition-colors`}>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-600" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-white border border-zinc-200 text-zinc-600 shadow-sm">
                                {ranking.mediaType}
                              </span>
                              <p className="text-sm font-bold text-zinc-900 capitalize truncate max-w-[200px]">
                                {ranking.query}
                              </p>
                            </div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                              {ranking.itemCount} Ranked Subjects
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, ranking.key)}
                          className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                          title="Delete saved ranking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Accordion Body */}
                      {isExpanded && (
                        <div className="p-4 bg-zinc-50/50">
                          <div className="space-y-2">
                            {ranking.data.map((item, index) => {
                              const isPhoto = ranking.mediaType === 'photos';
                              const thumb = isPhoto ? (item.src?.tiny || item.src?.small) : item.image;
                              const title = isPhoto ? (item.alt || 'Stock Photo') : `Video by ${item.user?.name}`;
                              const creator = isPhoto ? item.photographer : item.user?.name;

                              return (
                                <div key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-zinc-100 shadow-sm">
                                  <div className="w-8 flex justify-center shrink-0">
                                    <span className="text-xs font-bold text-zinc-400">#{index + 1}</span>
                                  </div>
                                  <img 
                                    src={thumb} 
                                    alt={title} 
                                    className="w-10 h-10 object-cover rounded bg-zinc-100 shrink-0 border border-zinc-100"
                                  />
                                  <div className="flex-1 min-w-0 py-1">
                                    <p className="text-[11px] font-bold text-zinc-800 truncate">
                                      {title}
                                    </p>
                                    <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold truncate mt-0.5">
                                      {creator}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
