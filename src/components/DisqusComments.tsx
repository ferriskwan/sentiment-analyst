import React, { useEffect } from 'react';

export function DisqusComments() {
  useEffect(() => {
    // Check if the script is already loaded to avoid duplicates on hot reloads
    if (!document.getElementById('disqus-script')) {
      const script = document.createElement('script');
      script.id = 'disqus-script';
      script.src = 'https://sentiment-analysis.disqus.com/embed.js';
      script.setAttribute('data-timestamp', (+new Date()).toString());
      script.async = true;
      (document.head || document.body).appendChild(script);
    } else {
      // If DISQUS is already loaded globally, we can attempt to reset it.
      if ((window as any).DISQUS) {
        (window as any).DISQUS.reset({
          reload: true
        });
      }
    }
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div id="disqus_thread"></div>
      <noscript>
        Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a>
      </noscript>
    </div>
  );
}
