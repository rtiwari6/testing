import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};

/**
 * Detects if the application is running inside an in-app browser/webview
 */
export const isEmbedded = (): boolean => {
  // Return false if running on server
  if (typeof window === 'undefined') return false;
  
  const ua = navigator.userAgent || '';
  
  // Patterns for common in-app browsers and webviews
  const patterns = [
    // Social media apps
    /FBAN|FBAV|FB_IAB/i,            // Facebook
    /Instagram/i,                   // Instagram
    /Twitter/i,                     // Twitter
    /LinkedIn(App)?/i,              // LinkedIn
    /\bPinterest\b/i,               // Pinterest
    /TikTok/i,                      // TikTok
    
    // Messaging apps
    /\bLine\b/i,                    // Line
    /\bFBMessenger\b|MESSENGER/i,   // Facebook Messenger
    /\bWhatsApp\b/i,                // WhatsApp
    /\bTelegram\b/i,                // Telegram
    
    // Mail apps
    /\bGmail\b/i,                   // Gmail
    
    // Generic webview indicators
    /\bwv\b|WebView/i,              // Generic WebView
    /Android.*(wv|.0.0.0)/,         // Android WebView
    
    // iOS in-app browser indicators
    /^Mozilla.*Darwin.*iPhone.*AppleWebKit(?!.*Safari)/i,
    
    // Additional patterns
    /GSA\/|Google\/|__GSA__/i,      // Google app
  ];
  
  return patterns.some(pattern => pattern.test(ua));
};

/**
 * Gets the current platform (iOS or Android)
 */
export const getMobilePlatform = (): 'ios' | 'android' | 'other' => {
  if (typeof window === 'undefined') return 'other';
  
  const ua = navigator.userAgent || '';
  
  if (/iPhone|iPad|iPod/i.test(ua)) {
    return 'ios';
  } else if (/Android/i.test(ua)) {
    return 'android';
  }
  
  return 'other';
};

/**
 * Constructs a URL for opening the app in a browser
 */
export const getExternalBrowserUrl = (): string => {
  if (typeof window === 'undefined') return '';

  // Get the current URL
  const currentUrl = window.location.href;

  // For iOS we can use the special "x-web-search" protocol
  const platform = getMobilePlatform();

  if (platform === 'ios') {
    // This will open Safari with the URL
    return `x-web-search://${encodeURIComponent(currentUrl)}`;
  } else {
    // For Android, we simply return the URL since we'll use an intent system
    return currentUrl;
  }
};
