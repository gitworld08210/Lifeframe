export interface User {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  bannerUrl: string;
  bio: string;
  socialLinks: SocialLink[];
  interests: string[];
  followerCount: number;
  followingCount: number;
  postCount: number;
  reelCount: number;
  isVerified: boolean;
  verificationTier: VerificationTier;
  isFounder: boolean;
  isCreator: boolean;
  isPremium: boolean;
  premiumTier: PremiumTier;
  auraPoints: number;
  createdAt: string;
  lastActiveAt: string;
  onboardingComplete: boolean;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export type VerificationTier = 'none' | 'basic' | 'creator' | 'business' | 'celebrity';

export type PremiumTier = 'none' | 'silver' | 'gold';
