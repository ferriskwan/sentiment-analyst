import React, { useEffect } from 'react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  const pageIdentifier = query || 'home';
  const shortname = 'sentiment-analysis-1';

  useEffect(() => {
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
      s.src = 'https://sentiment-analysis-1.disqus.com/embed.js';
      s.setAttribute('data-timestamp', (+new Date()).toString());
      (d.head || d.body).appendChild(s);
    }
  }, [pageIdentifier]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">Community Discussion</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[200px]">
          {/* Key forces the div to be recreated if needed, but we keep the ID consistent */}
          <div id="disqus_thread"></div>
          <noscript>
            Please enable JavaScript to view the{' '}
            <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
          </noscript>
        </div>
      </div>
    </div>
  );
}
