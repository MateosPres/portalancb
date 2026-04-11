import React from 'react';
import { LiveYouTubePlayer } from './LiveYouTubePlayer';

interface LiveYouTubeWithChatProps {
  videoId: string;
  domain: string;
  onClose?: () => void;
  chatPanelWidthPx?: number;
}

const normalizeDomain = (value: string) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return '';

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, '');
  return withoutProtocol.split('/')[0];
};

export const LiveYouTubeWithChat: React.FC<LiveYouTubeWithChatProps> = ({
  videoId,
  domain,
  onClose,
  chatPanelWidthPx = 380,
}) => {
  const safeDomain = normalizeDomain(domain) || window.location.hostname;
  const safeChatWidth = Math.max(350, Math.min(400, chatPanelWidthPx));
  const chatSrc = `https://www.youtube.com/live_chat?is_popout=1&v=${encodeURIComponent(videoId)}&embed_domain=${encodeURIComponent(safeDomain)}`;

  return (
    <section
      className="yt-live-layout rounded-2xl overflow-hidden bg-black shadow-2xl"
      aria-label="Transmissao ao vivo e chat do YouTube"
    >
      {/*
        Flex layout strategy:
        - Portrait (default): column to keep video 16:9 on top and chat filling remaining height.
        - Desktop (lg+): row with a fluid video area and fixed chat panel width (350-400px).
        - Mobile landscape: handled in index.css media query to force row even below lg.
      */}
      <div className="yt-live-layout__inner flex h-full min-h-0 flex-col lg:flex-row">
        <div className="yt-live-layout__video min-h-0 flex-1 bg-black">
          <LiveYouTubePlayer videoId={videoId} onClose={onClose} />
        </div>

        {/*
          Chat panel sizing:
          - Portrait: full width and flex-1 (takes remaining viewport height).
          - Desktop: fixed width panel, independent from video growth.
          - Chat iframe keeps width/height 100%, so scroll is internal to the iframe area.
        */}
        <aside
          className="yt-live-layout__chat flex min-h-0 flex-1 overflow-hidden border-t border-white/10 bg-white dark:bg-gray-900 lg:flex-none lg:border-l lg:border-t-0"
          style={{ width: `min(100%, ${safeChatWidth}px)` }}
          aria-label="Chat ao vivo"
        >
          <iframe
            title="Chat ao vivo YouTube"
            src={chatSrc}
            width="100%"
            height="100%"
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; clipboard-write"
            referrerPolicy="origin"
          />
        </aside>
      </div>
    </section>
  );
};
