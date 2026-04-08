export const extractYouTubeVideoId = (input: string): string | null => {
  const value = input.trim();
  if (!value) return null;

  // Accept raw video id directly.
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);
    const host = parsed.hostname.replace('www.', '').toLowerCase();

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '').split('/')[0] || '';
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v') || '';
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }

      if (parsed.pathname.startsWith('/embed/')) {
        const id = parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }

      if (parsed.pathname.startsWith('/live/')) {
        const id = parsed.pathname.split('/live/')[1]?.split('/')[0] || '';
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const toYouTubeWatchUrl = (videoId: string): string => `https://www.youtube.com/watch?v=${videoId}`;
