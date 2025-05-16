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
import { getExternalBrowserUrl } from '@/lib/utils';



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
              onClick={() => {
                // Create a hidden link to trigger the browser
                const link = document.createElement('a');
                link.href = getExternalBrowserUrl();
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                onClose();
              }}
          >
            Open in Browser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BrowserRedirectModal;
