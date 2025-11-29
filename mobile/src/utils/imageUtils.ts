const API_URL = 'http://192.168.11.166:3000';

/**
 * Convert relative image URL to absolute URL
 * @param url - Relative or absolute URL
 * @returns Absolute URL
 */
export const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // If already absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Convert relative URL to absolute
  return `${API_URL}${url}`;
};
