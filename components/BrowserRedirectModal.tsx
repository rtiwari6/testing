"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {getExternalBrowserUrl, getMobilePlatform, isEmbedded} from '@/lib/utils';

interface BrowserRedirectModalProps {
  isOpen: boolean;
  platform: 'ios' | 'android' | 'other';
  onClose: () => void;
}

const BrowserRedirectModal = ({
                                isOpen,
                                platform,
                                onClose
                              }: BrowserRedirectModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent rendering during SSR
  if (!isMounted) return null;

  const handleOpenInBrowser = () => {
    const externalUrl = getExternalBrowserUrl();   // now x-safari-https://…
    const { origin, pathname, search, hash } = window.location;
    const currentUrl = `${origin}${pathname}${search}${hash}`;

    if (platform === "ios") {
      // 1️⃣  Try the x-safari- scheme (no Google search!)
      window.location.href = externalUrl;

      // 2️⃣  Fallback – open in Chrome if installed
      setTimeout(() => {
        window.location.href =
            `googlechrome://navigate?url=${encodeURIComponent(currentUrl)}`;

        // 3️⃣  Final fallback – let the system decide
        setTimeout(() => {
          window.open(currentUrl, "_system");
        }, 300);
      }, 300);
    } else if (platform === "android") {
      /* 1️⃣ try intent:// — user sees browser picker */
      window.location.href = externalUrl;

      /* 2️⃣ soft fallback only if we’re *still* inside the web-view after 1.5 s */
      setTimeout(() => {
        if (isEmbedded()) window.open(currentUrl, "_blank");
      }, 1500);
    } else {
      window.open(currentUrl, "_blank");
    }

    onClose();
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>
            Open in Browser
          </DialogTitle>
          <DialogDescription>
            For the best experience with Google Sign-In, please open this page in your device's browser.
          </DialogDescription>

          <div className="flex flex-col space-y-4 mt-4">
            <p className="text-sm">
              Using Google Sign-In may not work properly in in-app browsers. Opening in your device's native browser will ensure a smooth login experience.
            </p>

            {platform === 'ios' && (
                <p className="text-xs text-muted-foreground">
                  You'll be redirected to Safari to continue.
                </p>
            )}

            {platform === 'android' && (
                <p className="text-xs text-muted-foreground">
                  Select your browser when prompted to continue.
                </p>
            )}
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Continue Anyway
            </Button>

            <Button
                onClick={handleOpenInBrowser}
                className="bg-primary text-white hover:bg-primary/90"
            >
              Open in Browser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default BrowserRedirectModal;