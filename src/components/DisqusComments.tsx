import React, { useEffect } from 'react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  useEffect(() => {
    // Define the disqus config globally so the embed script picks it up, or reset uses it.
    const config = function (this: any) {
      this.page.identifier = query || 'home';
      this.page.url = window.location.href;
      this.page.title = query ? `Search: ${query}` : 'Home';
    };

    if (!document.getElementById('disqus-script')) {
      (window as any).disqus_config = config;
      
      const script = document.createElement('script');
      script.id = 'disqus-script';
      script.src = 'https://sentiment-analysis.disqus.com/embed.js';
      script.setAttribute('data-timestamp', (+new Date()).toString());
      script.async = true;
      (document.head || document.body).appendChild(script);
    } else {
      // If DISQUS is already loaded globally, reset it for the new query.
      if ((window as any).DISQUS) {
        (window as any).DISQUS.reset({
          reload: true,
          config: config
        });
      }
    }
  }, [query]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div id="disqus_thread"></div>
      <noscript>
        Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
      </noscript>
    </div>
  );
}
