import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDirectImageUrl(url: string) {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
    }
  }
  return url;
}

export function safeJsonParse(text: string) {
    let cleanText = text.replace(/^\s*```(?:json)?\n?|\n?```\s*$/g, '');
    try {
        return JSON.parse(cleanText);
    } catch (e) {
        console.warn("safeJsonParse: Attempting JSON repair due to:", e);
        cleanText = cleanText.replace(/[\u0000-\u001F]+/g, ' ');
        cleanText = cleanText.replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(cleanText);
    }
}
