// src/components/BrowserRedirectModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  isEmbedded,
  getMobilePlatform,
  getExternalBrowserUrl,
} from "@/lib/utils";

interface BrowserRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BrowserRedirectModal = ({
                                isOpen,
                                onClose,
                              }: BrowserRedirectModalProps) => {
  const [hasChecked, setHasChecked] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">(
      "other"
  );
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    // run only on client
    if (typeof window === "undefined") return;

    setPlatform(getMobilePlatform());
    setInApp(isEmbedded());
    setHasChecked(true);
  }, []);

  // don't render until we've detected platform
  if (!hasChecked) {
    return null;
  }

  const handleOpenInBrowser = () => {
    const { origin, pathname, search, hash } = window.location;
    const currentUrl = `${origin}${pathname}${search}${hash}`;
    const urlNoScheme = currentUrl.replace(/^https?:\/\//, "");

    if (platform === "ios") {
      // 1️⃣  Deep link into Safari
      window.location.href = getExternalBrowserUrl();

      // 2️⃣  Fallback: Chrome for iOS
      setTimeout(() => {
        window.location.href = `googlechrome://navigate?url=${encodeURIComponent(
            currentUrl
        )}`;

        // 3️⃣  Last fallback: system choice
        setTimeout(() => {
          window.open(currentUrl, "_blank");
        }, 300);
      }, 300);
    } else if (platform === "android") {
      if (inApp) {
        // In-app WebView/embedded browser → force Chrome via intent
        window.location.href =
            `intent://${urlNoScheme}` +
            `#Intent;scheme=https;package=com.android.chrome;end`;
      } else {
        // 1️⃣  Intent deep link
        window.location.href = getExternalBrowserUrl();

        // 2️⃣  Fallback: Chrome scheme
        setTimeout(() => {
          window.location.href = `googlechrome://navigate?url=${encodeURIComponent(
              currentUrl
          )}`;

          // 3️⃣  Final fallback: new tab
          setTimeout(() => {
            window.open(currentUrl, "_blank");
          }, 500);
        }, 500);
      }
    } else {
      // Desktop or other: open new tab
      window.open(currentUrl, "_blank");
    }

    onClose();
  };

  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Open in Browser</DialogTitle>

          <div className="flex flex-col space-y-4 mt-4">
            <p className="text-sm">
              To continue with Google Sign-In, please open this page in your
              browser.
            </p>

            {platform === "ios" && (
                <p className="text-xs text-muted-foreground">
                  You’ll be redirected to Safari to continue.
                </p>
            )}
            {platform === "android" && inApp && (
                <p className="text-xs text-muted-foreground">
                  You’ll be redirected to Chrome to continue.
                </p>
            )}
            {platform === "android" && !inApp && (
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
