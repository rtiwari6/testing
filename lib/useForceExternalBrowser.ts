
'use client';

import { useEffect } from 'react';
import { isEmbedded } from '@/lib/utils';

export function useForceExternalBrowser() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isEmbedded()) return;                        

    const ua = navigator.userAgent || '';
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const url = window.location.href;

    if (isAndroid) {
      /* ① Android: jump to Chrome via intent:// — user sees the native prompt */
      const intent = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      // slight delay so the page at least renders a frame
      setTimeout(() => { window.location.href = intent; }, 300);
    } else if (isIOS) {
      /* ② iOS: we cannot programmatically launch Safari; ask first */
      const agree = window.confirm(
        'Google Sign‑In needs Safari. Tap “OK” to open this page in Safari.'
      );
      if (agree) {
        // Opens a new top‑level tab; Safari takes over outside the WebView
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
    /* Other platforms (rare): do nothing */
  }, []);
}
