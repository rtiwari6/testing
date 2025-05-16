import { useEffect, useState } from 'react';
import { isEmbedded, getMobilePlatform } from '@/lib/utils';

interface UseBrowserDetectionReturn {
  isInAppBrowser: boolean;
  platform: 'ios' | 'android' | 'other';
  hasChecked: boolean;
}

/**
 * Hook to detect if the app is running in an in-app browser and what platform it's on
 */
export const useBrowserDetection = (): UseBrowserDetectionReturn => {
  const [isInAppBrowser, setIsInAppBrowser] = useState<boolean>(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');
  const [hasChecked, setHasChecked] = useState<boolean>(false);

  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const embedded = isEmbedded();
      const mobilePlatform = getMobilePlatform();
      
      setIsInAppBrowser(embedded);
      setPlatform(mobilePlatform);
      setHasChecked(true);
    }
  }, []);

  return { isInAppBrowser, platform, hasChecked };
};
