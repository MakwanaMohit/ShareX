/**
 * Media helper utilities for images and videos across ShareX
 */

// Format URL to ensure both absolute and relative backend uploads resolve properly
export function formatMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // If it's a relative path like /uploads/...
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Compress image file to lightweight Base64 data URL via HTML Canvas (fallback or pre-processing)
export function compressImageFile(file, maxWidth = 800, maxHeight = 800, quality = 0.8) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Invalid image file'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

// Convert video file to data URL (fallback preview)
export function readVideoFile(file, maxMb = 50) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));
    if (!file.type.startsWith('video/')) {
      return reject(new Error('Selected file is not a video'));
    }

    if (file.size > maxMb * 1024 * 1024) {
      return reject(
        new Error(`Video file is larger than ${maxMb}MB. Please use a shorter clip or YouTube link.`)
      );
    }

    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error('Failed to read video file'));
    reader.readAsDataURL(file);
  });
}

// Parse YouTube URL to embed link
export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : null;
}

// Parse Vimeo URL to embed link
export function getVimeoEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/[^\/]*\/videos\/|album\/\d+\/video\/|)(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : null;
}

// Check if a URL represents a video
export function isVideoSource(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.startsWith('data:video/')) return true;
  if (getYouTubeEmbedUrl(url) || getVimeoEmbedUrl(url)) return true;
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}
