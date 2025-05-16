'use client';

import { useEffect } from 'react';
import { signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, provider } from '@/firebase/client';

export default function GoogleExternal() {
  useEffect(() => {
    (async () => {
      // 1. If we’ve just returned from Google…
      const result = await getRedirectResult(auth);
      if (result) {
        window.close();   // close the tab, back to the app
        return;
      }
      // 2. Otherwise start the redirect sign-in
      await signInWithRedirect(auth, provider);
    })();
  }, []);

  return (
    <main className="grid place-items-center h-screen">
      <p>Redirecting to Google…</p>
    </main>
  );
}
