import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pageIdentifier = query || 'home';

  useEffect(() => {
    // 1. Set up the exact disqus_config as requested
    (window as any).disqus_config = function () {
      this.page.url = window.location.href; // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = pageIdentifier; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };

    // 2. Inject the script exactly as requested, but safely handle React re-renders
    const scriptId = 'disqus-embed-script';
    
    if (!document.getElementById(scriptId)) {
      // DON'T EDIT BELOW THIS LINE (from user snippet)
      const d = document, s = d.createElement('script');
      s.id = scriptId;
      s.src = 'https://proptrust.disqus.com/embed.js';
      s.setAttribute('data-timestamp', (+new Date()).toString());
      (d.head || d.body).appendChild(s);
    } else {
      // If script is already loaded (e.g. user navigated routes), we just reset Disqus
      if ((window as any).DISQUS && typeof (window as any).DISQUS.reset === 'function') {
        try {
          (window as any).DISQUS.reset({
            reload: true,
            config: (window as any).disqus_config
          });
        } catch (error) {
          console.error("Disqus reset failed", error);
        }
      }
    }
  }, [pageIdentifier]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Panel */}
      <div
        className={`transition-all duration-300 ease-in-out origin-bottom-right bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden absolute bottom-[4.5rem] right-0 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] ${
          isExpanded
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-90 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10 shrink-0">
          <h3 className="font-semibold text-gray-900 font-display">Community Discussion</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Comments Container */}
        {/* We ALWAYS render the thread so the script can find it immediately on mount */}
        <div className="flex-1 overflow-y-auto p-4 bg-white relative w-full h-full">
          {/* Inline styles using hex codes prevent Disqus's older color parser from crashing on Tailwind v4's oklch() variables */}
          <div id="disqus_thread" className="w-full min-h-[400px]" style={{ color: '#18181b', backgroundColor: '#ffffff' }}></div>
          <noscript>
            Please enable JavaScript to view the{' '}
            <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
          </noscript>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center justify-center p-4 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 ${
          isExpanded ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'
        }`}
        aria-label="Toggle comments"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}


