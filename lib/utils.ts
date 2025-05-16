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
 * Builds a deep-link that tries to open the page
 * in the user’s real browser instead of the in-app web-view.
 */
/**
 * Builds a deep link that opens the page in a real browser
 * on Android (intent://…) or iOS (x-safari-https://…).
 */
export const getExternalBrowserUrl = (): string => {
  if (typeof window === "undefined") {
    return "https://testing-psi-virid.vercel.app/";           // SSR fallback
  }

  const { href, protocol } = window.location;                 // full URL e.g. https://foo.com/bar?x=1#y
  const platform = getMobilePlatform();

  /* ---------- iOS ---------- */
  if (platform === "ios") {
    const scheme = protocol === "https:" ? "x-safari-https://" : "x-safari-http://";
    return href.replace(/^https?:\/\//, scheme);
  }

  /* ---------- Android ---------- */
  if (platform === "android") {
    // remove "https://" or "http://"
    const urlWithoutScheme = href.replace(/^https?:\/\//, "");

    /* Full intent URL:
       - opens the chooser if several browsers exist
       - falls back to the normal link if the user cancels */
    return (
        `intent://${urlWithoutScheme}` +
        `#Intent;scheme=${protocol.slice(0, -1)}` +             // http or https
        `;action=android.intent.action.VIEW` +
        `;category=android.intent.category.BROWSABLE` +
        `;S.browser_fallback_url=${encodeURIComponent(href)}` + // graceful fallback
        `;end`
    );
  }

  /* ---------- Desktop / others ---------- */
  return href;
};
