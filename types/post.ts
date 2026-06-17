export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string;
  content: string;
  images: string[]; // Cloudinary public_ids
  audience: 'public' | 'followers';
  hashtags: string[];
  mentions: string[];
  likeCount: number;
  commentCount: number;
  repostCount: number;
  saveCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorAvatarUrl: string;
  content: string;
  mentions: string[];
  likeCount: number;
  createdAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  type: 'like' | 'love' | 'fire' | 'clap' | 'mind_blown';
  createdAt: string;
}
