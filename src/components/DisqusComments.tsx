import React from 'react';
import { DiscussionEmbed } from 'disqus-react';

interface DisqusCommentsProps {
  query: string;
}

export function DisqusComments({ query }: DisqusCommentsProps) {
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const pageIdentifier = query || 'home';

  const disqusConfig = {
    url: pageUrl,
    identifier: pageIdentifier,
    title: `Visual Impact - ${pageIdentifier}`,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
        <h3 className="text-xl font-display font-semibold text-gray-900 mb-6">Community Discussion</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[200px]">
          <DiscussionEmbed
            shortname="sentiment-analysis-1"
            config={disqusConfig}
          />
        </div>
      </div>
    </div>
  );
}
