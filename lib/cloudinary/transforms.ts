import { CLOUDINARY_CLOUD_NAME } from './config';

const BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Generate a feed thumbnail URL (600px wide, auto quality/format)
 */
export function feedThumbnail(publicId: string): string {
  return `${BASE_URL}/w_600,q_auto,f_auto/${publicId}`;
}

/**
 * Generate a full-size image URL for lightbox viewing (1600px wide)
 */
export function fullSize(publicId: string): string {
  return `${BASE_URL}/w_1600,q_auto,f_auto/${publicId}`;
}

/**
 * Generate an avatar URL (200x200, face-crop, auto quality/format)
 */
export function avatarUrl(publicId: string): string {
  return `${BASE_URL}/w_200,h_200,c_fill,g_face,q_auto,f_auto/${publicId}`;
}
