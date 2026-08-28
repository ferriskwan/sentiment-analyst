import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pageIdentifier = query || 'home';
  const shortname = 'proptrust';

  useEffect(() => {
    // Only initialize or reset Disqus when the panel is expanded
    // This prevents Disqus from rendering into a 0-height container
    if (!isExpanded) return;

    const timer = setTimeout(() => {
      (window as any).disqus_config = function (this: any) {
        this.page.url = window.location.href;
        this.page.identifier = pageIdentifier;
      };

      if ((window as any).DISQUS) {
        (window as any).DISQUS.reset({
          reload: true,
          config: (window as any).disqus_config,
        });
      } else {
        const d = document, s = d.createElement('script');
        s.src = `https://${shortname}.disqus.com/embed.js`;
        s.setAttribute('data-timestamp', (+new Date()).toString());
        (d.head || d.body).appendChild(s);
      }
    }, 150); // Small delay to ensure the DOM has updated and transition started

    return () => clearTimeout(timer);
  }, [isExpanded, pageIdentifier, shortname]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Panel */}
      <div
        className={`transition-all duration-300 ease-in-out origin-bottom-right bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden mb-4 ${
          isExpanded
            ? 'scale-100 opacity-100 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)]'
            : 'scale-95 opacity-0 w-[400px] max-w-[calc(100vw-3rem)] h-[0px] pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
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
        <div className="flex-1 overflow-y-auto p-4 bg-white relative">
          {isExpanded && <div id="disqus_thread"></div>}
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
          isExpanded ? 'scale-0 opacity-0 absolute' : 'scale-100 opacity-100'
        }`}
        aria-label="Toggle comments"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}

