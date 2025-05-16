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
import { getMobilePlatform } from '@/lib/utils';

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

    if (platform === 'ios') {
      // For iOS, direct open in Safari using a simple approach
      // This is the most reliable way to force opening in Safari from in-app browsers
      window.location.href = currentUrl;

      // Add a small timeout for tracking purposes
      setTimeout(() => {
        console.log("Attempted to open in Safari");
      }, 100);
    } else if (platform === 'android') {
      // For Android, use intent URL
      window.location.href = `intent:${currentUrl}#Intent;scheme=https;package=com.android.chrome;end`;

      // Fallback if intent doesn't work
      setTimeout(() => {
        window.open(currentUrl, '_system');
      }, 300);
    } else {
      // For desktop/other, simply open in new tab
      window.open(currentUrl, '_blank');
    }

    // Close the modal after attempting to open
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