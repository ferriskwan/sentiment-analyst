import React, { useEffect } from 'react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  const pageIdentifier = query || 'home';
  const shortname = 'sentiment-analysis-1';

  useEffect(() => {
    // Small delay to ensure the #disqus_thread div is firmly in the DOM
    const timer = setTimeout(() => {
      const disqus_config = function (this: any) {
        this.page.url = window.location.href;
        this.page.identifier = pageIdentifier;
        this.page.title = `Visual Impact - ${pageIdentifier}`;
      };

      (window as any).disqus_config = disqus_config;

      // If the script is already loaded, reset the instance
      if ((window as any).DISQUS) {
        (window as any).DISQUS.reset({
          reload: true,
          config: disqus_config,
        });
      } else {
        // Otherwise inject the script
        let script = document.getElementById('disqus-embed-script') as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script');
          script.id = 'disqus-embed-script';
          script.src = `https://${shortname}.disqus.com/embed.js`;
          script.async = true;
          script.setAttribute('data-timestamp', (+new Date()).toString());
          (document.head || document.body).appendChild(script);
        }
      }
    }, 200); // 200ms delay helps prevent React strict mode double-mount race conditions

    return () => clearTimeout(timer);
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
