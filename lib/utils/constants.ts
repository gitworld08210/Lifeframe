export const APP_NAME = 'Lifeframe';

export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  feed: '/feed',
  explore: '/explore',
  reels: '/reels',
  messages: '/messages',
  creatorHub: '/creator-hub',
  profile: (username: string) => `/profile/${username}`,
} as const;

export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;
