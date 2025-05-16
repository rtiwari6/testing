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

  const handleOpenInBrowser = () => {
    const externalUrl = getExternalBrowserUrl();
    
    if (platform === 'ios') {
      // For iOS, we use the special URL scheme that triggers Safari
      window.location.href = externalUrl;
      
      // iOS might not always redirect, so we provide a fallback
      setTimeout(() => {
        window.location.href = window.location.href;
      }, 500);
    } else if (platform === 'android') {
      // For Android, we open in a new tab which will trigger the browser selection
      window.open(externalUrl, '_system');
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
        
        <DialogFooter className="flex sm:justify-between flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>
            Continue Anyway
          </Button>
          <Button onClick={handleOpenInBrowser}>
            Open in Browser
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BrowserRedirectModal;
