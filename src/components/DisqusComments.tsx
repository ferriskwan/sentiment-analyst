import React, { useEffect, useRef } from 'react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  const isMounted = useRef(false);

  useEffect(() => {
    var PAGE_URL = window.location.href;
    var PAGE_IDENTIFIER = query || 'home';

    /**
    *  RECOMMENDED CONFIGURATION VARIABLES: EDIT AND UNCOMMENT THE SECTION BELOW TO INSERT DYNAMIC VALUES FROM YOUR PLATFORM OR CMS.
    *  LEARN WHY DEFINING THESE VARIABLES IS IMPORTANT: https://disqus.com/admin/universalcode/#configuration-variables    */
    var disqus_config = function (this: any) {
      this.page.url = PAGE_URL;  // Replace PAGE_URL with your page's canonical URL variable
      this.page.identifier = PAGE_IDENTIFIER; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
    };
    
    (window as any).disqus_config = disqus_config;

    if (!document.getElementById('disqus-embed-script')) {
      (function() { // DON'T EDIT BELOW THIS LINE
        var d = document, s = d.createElement('script');
        s.id = 'disqus-embed-script'; // Added to prevent duplicate injections in React StrictMode
        s.src = 'https://sentiment-analysis-1.disqus.com/embed.js';
        s.setAttribute('data-timestamp', (+new Date()).toString());
        (d.head || d.body).appendChild(s);
      })();
    } else {
      // React-specific: reset Disqus when the search query changes without a full page reload
      setTimeout(() => {
        if ((window as any).DISQUS) {
          (window as any).DISQUS.reset({ reload: true, config: disqus_config });
        }
      }, 100);
    }
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
