import React, { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const pageIdentifier = query || 'home';
  const shortname = 'proptrust';

  useEffect(() => {
    if (isExpanded) {
      setHasOpened(true);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (!hasOpened) return;

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
      const scriptId = 'disqus-embed-script';
      if (!document.getElementById(scriptId)) {
        const d = document,
          s = d.createElement('script');
        s.id = scriptId;
        s.src = `https://${shortname}.disqus.com/embed.js`;
        s.setAttribute('data-timestamp', (+new Date()).toString());
        (d.head || d.body).appendChild(s);
      }
    }
  }, [hasOpened, pageIdentifier, shortname]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Panel */}
      <div
        className={`transition-all duration-300 ease-in-out origin-bottom-right bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden mb-4 absolute bottom-[4rem] right-0 w-[400px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] ${
          isExpanded
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-90 opacity-0 pointer-events-none'
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
        <div className="flex-1 overflow-y-auto p-4 bg-white relative w-full h-full">
          {hasOpened && <div id="disqus_thread" className="w-full min-h-[400px]"></div>}
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


