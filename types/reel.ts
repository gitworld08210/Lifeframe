export interface Reel {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string;
  videoPublicId: string; // Cloudinary public_id
  hlsManifestUrl: string;
  thumbnailUrl: string;
  caption: string;
  hashtags: string[];
  audience: 'public' | 'followers';
  duration: number; // seconds
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  saveCount: number;
  processing: boolean;
  createdAt: string;
}
