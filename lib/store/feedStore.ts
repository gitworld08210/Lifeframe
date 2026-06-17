import { create } from 'zustand';
import type { Post } from '@/types/post';

interface FeedState {
  posts: Post[];
  hasMore: boolean;
  cursor: string | null;
  setPosts: (posts: Post[]) => void;
  appendPosts: (posts: Post[]) => void;
  reset: () => void;
  setCursor: (cursor: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  hasMore: true,
  cursor: null,
  setPosts: (posts) => set({ posts }),
  appendPosts: (posts) =>
    set((state) => ({ posts: [...state.posts, ...posts] })),
  reset: () => set({ posts: [], hasMore: true, cursor: null }),
  setCursor: (cursor) => set({ cursor }),
  setHasMore: (hasMore) => set({ hasMore }),
}));
