import { useState, useEffect } from 'react';
import { Reorder, AnimatePresence, motion } from 'motion/react';
import { GripVertical, AlertCircle, Loader2, Check } from 'lucide-react';

interface Photo {
  id: number;
  url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
  photographer: string;
}

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/images')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.photos) {
          setPhotos(data.photos);
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD] p-6">
        <div className="bg-white text-[#1A1A1A] p-6 flex items-start gap-4 max-w-md border border-gray-200 rounded-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <div>
            <h3 className="text-xs uppercase tracking-[0.1em] font-bold mb-2">Configuration Error</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{error}</p>
            <p className="text-xs text-gray-500 leading-relaxed mt-2">
              Please ensure you have added a valid PEXELS_API_KEY in the application settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] flex flex-col font-sans">
      {/* Geometric Header */}
      <header className="h-20 px-6 md:px-10 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex w-8 h-8 bg-black rounded-full items-center justify-center shrink-0">
            <div className="w-3 h-3 bg-white rotate-45"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] flex flex-wrap items-center">
            VISUAL IMPACT <span className="font-light text-gray-400 ml-1">/ Ranker v1.0</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-none">Task Mode</p>
            <p className="text-xs font-semibold">TRANSACTION_LIKELIHOOD</p>
          </div>
          <div className="hidden md:block h-10 w-[1px] bg-gray-200"></div>
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-4 md:px-6 py-2 rounded-sm text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {submitted ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              'Submit Ranking'
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Analysis Pool (5 Subjects)</h2>
          <p className="text-[11px] italic text-gray-400 hidden sm:block">Drag items to rank by transaction likelihood</p>
        </div>
        <Reorder.Group
          axis="y"
          values={photos}
          onReorder={setPhotos}
          className="space-y-3"
        >
          <AnimatePresence>
            {photos.map((photo, index) => (
              <Reorder.Item
                key={photo.id}
                value={photo}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 cursor-grab active:cursor-grabbing relative transition-all hover:border-black group select-none shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Rank Indicator */}
                <span className="text-3xl font-display italic text-gray-300 w-12 text-center shrink-0 transition-colors group-hover:text-gray-900">
                  {(index + 1).toString().padStart(2, '0')}
                </span>

                {/* Image Container */}
                <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-sm overflow-hidden bg-gray-100 relative group-active:scale-95 transition-transform duration-300">
                  <img
                    src={photo.src.large}
                    alt={photo.alt}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-900 truncate">
                    {photo.alt || 'Scene_Untitled'}
                  </p>
                  <p className="text-[10px] uppercase text-gray-400 tracking-widest truncate mt-1">
                    SRC // {photo.photographer}
                  </p>
                  
                  <div className="mt-3 flex sm:hidden items-center gap-1 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <GripVertical className="w-3 h-3" />
                    Drag to move
                  </div>
                </div>

                {/* Drag Handle Desktop */}
                <div className="hidden sm:flex shrink-0 w-12 h-12 items-center justify-center text-gray-300 group-hover:text-gray-600 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </main>

      <footer className="h-12 px-6 md:px-10 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white mt-auto">
        <div className="flex gap-4 md:gap-8">
          <p className="text-[10px] text-gray-400"><span className="font-bold text-gray-600 mr-1">LATENCY</span> 14ms</p>
          <p className="text-[10px] text-gray-400 hidden sm:block"><span className="font-bold text-gray-600 mr-1">API_STATUS</span> STABLE</p>
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Systems active &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
