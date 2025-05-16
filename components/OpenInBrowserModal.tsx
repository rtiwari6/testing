'use client';

import { useEffect, useState } from 'react';

export default function OpenInBrowserModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150); // avoids initial flash
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  const ua   = navigator.userAgent || '';
  const url  = window.location.href;
  const isAndroid = /Android/i.test(ua);
  const isIOS     = /iPhone|iPad|iPod/i.test(ua);

  // ——— Android: fire Chrome intent automatically (still keep the button as fallback)
  useEffect(() => {
    if (isAndroid) {
      const intent = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.replace(intent);
    }
  }, [isAndroid, url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
        <h2 className="text-lg font-semibold mb-2">Open in your browser</h2>
        <p className="text-sm text-gray-700 mb-4">
          Google Sign-In can’t run inside this app’s browser.
          Tap the button below to continue in {isIOS ? 'Safari' : 'Chrome'}.
        </p>

        {/* A *real* <a> element – iOS WebView allows this user-gesture */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Open in {isIOS ? 'Safari' : 'Chrome'}
        </a>

        {isIOS && (
          <p className="mt-3 text-xs text-gray-600">
            If nothing happens, tap <strong>Share → Open in Safari</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
