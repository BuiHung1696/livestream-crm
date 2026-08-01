import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return "0";
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatVND(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0 ₫";
  return `${formatNumber(amount)} ₫`;
}

/**
 * Returns direct URL to TikTok, Shopee, or Facebook channel page
 */
export function getChannelUrl(platform: string, handle: string): string {
  if (!handle) return "#";
  const cleanHandle = handle.replace(/^@/, "");
  if (platform === "TIKTOK_LIVE") {
    return `https://www.tiktok.com/@${cleanHandle}`;
  } else if (platform === "SHOPEE_LIVE") {
    return `https://shopee.vn/${cleanHandle}`;
  } else if (platform === "FACEBOOK_LIVE") {
    return `https://facebook.com/${cleanHandle}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(handle)}`;
}

/**
 * Compresses local image files using HTML5 Canvas to avoid browser LocalStorage quota limits.
 * Reduces 5MB+ photos to lightweight ~30KB-80KB data URLs.
 */
export function compressImageFile(file: File, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      // For videos or non-images, return object URL blob
      resolve(URL.createObjectURL(file));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  });
}
