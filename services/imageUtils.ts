/**
 * Image compression utility using Compressor.js
 * Compresses images before AI analysis and storage to prevent
 * localStorage quota errors and reduce API payload size.
 */

import Compressor from 'compressorjs';

/**
 * Compress a File or Blob and return a base64 string (without the data: prefix).
 * @param source  File/Blob from camera capture or file input
 * @param quality 0–1 JPEG quality (default 0.7)
 * @param maxWidth Max width in pixels (default 1280)
 */
export function compressImageToBase64(
  source: File | Blob,
  quality = 0.7,
  maxWidth = 1280
): Promise<string> {
  return new Promise((resolve, reject) => {
    new Compressor(source, {
      quality,
      maxWidth,
      maxHeight: 960,
      mimeType: 'image/jpeg',
      success(result: Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          // Return only the base64 part after the comma
          resolve(dataUrl.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(result);
      },
      error: reject,
    });
  });
}

/**
 * Compress a data-URL (from canvas.toDataURL) and return a base64 string.
 */
export async function compressDataUrl(dataUrl: string, quality = 0.7): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return compressImageToBase64(blob, quality);
}
