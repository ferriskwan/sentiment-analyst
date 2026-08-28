import React, { useEffect, useRef } from 'react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    const PAGE_IDENTIFIER = query || 'home';
    const PAGE_URL = window.location.href;

    const config = function (this: any) {
      this.page.url = PAGE_URL;
      this.page.identifier = PAGE_IDENTIFIER;
      this.page.title = `Search: ${PAGE_IDENTIFIER}`;
    };

    // Set the global config for the initial load
    (window as any).disqus_config = config;

    if (!document.getElementById('disqus-script')) {
      const d = document;
      const s = d.createElement('script');
      s.id = 'disqus-script';
      s.src = 'https://sentiment-analysis.disqus.com/embed.js';
      s.setAttribute('data-timestamp', (+new Date()).toString());
      s.async = true;
      (d.head || d.body).appendChild(s);
    } else {
      // If script is already there, we need to reset it.
      // We must wait a tick to ensure the DOM has painted the div
      setTimeout(() => {
        if (isMounted.current && (window as any).DISQUS) {
          (window as any).DISQUS.reset({
            reload: true,
            config: config
          });
        }
      }, 100);
    }

    return () => {
      isMounted.current = false;
    };
  }, [query]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">Community Discussion</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[200px]">
          <div id="disqus_thread"></div>
          <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
        </div>
      </div>
    </div>
  );
}
