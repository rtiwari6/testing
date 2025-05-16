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
import { getExternalBrowserUrl, getMobilePlatform, isEmbedded, isEmbedded } from '@/lib/utils';

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
    const { origin, pathname, search, hash } = window.location;
    const currentUrl = `${origin}${pathname}${search}${hash}`;

    // Only redirect if we're in an app's webview
    if (isEmbedded()) {
      if (platform === "ios") {
        // For iOS, use the x-safari- scheme
        window.location.href = `x-safari-https://${origin}${pathname}${search}${hash}`;
      } else if (platform === "android") {
        // For Android, use intent URL to open in system browser
        window.location.href = `intent://${origin}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    } else {
      // If we're already in a browser, just close the modal
      onClose();
    }
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>
            Open in Browser
          </DialogTitle>

          <div className="flex flex-col space-y-4 mt-4">
            <p className="text-sm">
              To continue with Google Sign-In, please open this page in your browser
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

            <Button
                onClick={handleOpenInBrowser}
                className="bg-blue-500/30 text-white backdrop-blur-md hover:bg-blue-500/50"

            >
              Open in Browser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

export default BrowserRedirectModal;