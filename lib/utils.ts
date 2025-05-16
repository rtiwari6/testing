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
    return response.ok;
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

// Simplified identifiers for common in-app browsers/webviews
const inAppBrowserIdentifiers = [
  "linkedinapp",
  "fban",      // Facebook App
  "fbav",      // Facebook App
  "instagram",
  "line",
  "wv",        // Generic WebView
  "fb_iab",    // Facebook in-app browser
  "messenger", // Generic messenger
  "whatsapp",
  "telegram",
  "pinterest",
  "tiktok",
  "gmail",
];

/**
 * Detects if the application is running inside an in-app browser/webview
 */
export const isEmbedded = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /iphone|ipad|android/i.test(ua);
  const isInApp = inAppBrowserIdentifiers.some((id) => ua.includes(id));
  return isMobile && isInApp;
};

/**
 * Gets the current platform (iOS, Android, or other)
 */
export const getMobilePlatform = (): "ios" | "android" | "other" => {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent || "";

  if (/iPhone|iPad|iPod/i.test(ua)) {
    return "ios";
  } else if (/Android/i.test(ua)) {
    return "android";
  }
  return "other";
};

/**
 * Builds a deep-link that tries to open the page
 * in the user’s real browser instead of the in-app web-view.
 */
export const getExternalBrowserUrl = (): string => {
  if (typeof window === "undefined") {
    // SSR fallback
    return "https://testing-psi-virid.vercel.app/";
  }

  const href = window.location.href;
  const { protocol } = window.location;
  const platform = getMobilePlatform();

  if (platform === "ios") {
    const scheme =
        protocol === "https:" ? "x-safari-https://" : "x-safari-http://";
    return href.replace(/^https?:\/\//, scheme);
  }

  if (platform === "android") {
    const parsed = new URL(href);
    const hostAndPath =
        parsed.host + parsed.pathname + parsed.search + parsed.hash;

    return (
        `intent://${hostAndPath}` +
        `#Intent;scheme=${parsed.protocol.replace(":", "")};` +
        `package=com.android.chrome;` +
        `S.browser_fallback_url=${encodeURIComponent(href)};` +
        `end`
    );
  }

  // Desktop or other platforms
  return href;
};
