'use client';

import { isEmbedded } from '@/lib/utils';
import OpenInBrowserModal from '@/components/OpenInBrowserModal';

export default function InAppBrowserGate() {
  const inApp = typeof window !== 'undefined' && isEmbedded();
  return inApp ? <OpenInBrowserModal /> : null;
}
