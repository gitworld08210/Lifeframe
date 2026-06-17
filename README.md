# GlassVerse - Social Media App 

A production-ready social media web app with **Liquid Glass UI**, combining Instagram Reels, X/Twitter Feed, and Telegram/WhatsApp Messaging.

Built with **React 18 + Firebase + Cloudinary**.

## Features

- **Auth** — Email/password signup & login (Firebase Auth)
- **Feed** — X-style posts with text & images, likes, comments, reposts
- **Reels** — Instagram-style vertical video reels with upload & likes
- **Chat** — Real-time 1:1 messaging (Telegram/WhatsApp style)
- **Follow System** — Follow/unfollow with follower counts
- **Notifications** — Real-time notifications for likes, comments, follows
- **Profiles** — Editable profiles with avatar & cover photo upload
- **Liquid Glass UI** — Glassmorphism with animated gradient backgrounds

## Tech Stack

| Tech | Use |
|------|-----|
| React 18 + Vite | Frontend |
| Firebase Auth | Authentication |
| Cloud Firestore | Real-time database |
| Cloudinary | Image & video storage |
| React Router 6 | Routing |

## Quick Start

```bash
# 1. Clone
git clone <repo-url>
cd social-glass

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env
# Fill in your Firebase & Cloudinary credentials

# 4. Run
npm run dev
```

## Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** → Email/Password
3. Enable **Cloud Firestore** (start in test mode)
4. Copy config to `.env`

### Required Firestore Indexes

| Collection | Fields |
|-----------|--------|
| `posts` | `authorId` (Asc) + `createdAt` (Desc) |
| `chats` | `participants` (Array) + `lastMessageAt` (Desc) |

### Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      match /{sub=**} { allow read, write: if request.auth != null; }
    }
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
      match /comments/{cid} { allow read, write: if request.auth != null; }
    }
    match /reels/{reelId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }
    match /chats/{chatId} {
      allow read, write: if request.auth != null && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      match /messages/{mid} { allow read, write: if request.auth != null; }
    }
  }
}
```

## Cloudinary Setup

1. Create account at [cloudinary.com](https://cloudinary.com/)
2. Settings → Upload → Add unsigned upload preset
3. Copy Cloud Name & Preset Name to `.env`

## Project Structure

```
src/
├── App.jsx              # Routes
├── firebase.js          # Firebase init
├── cloudinary.js        # Upload utility
├── main.jsx             # Entry point
├── components/
│   ├── Layout.jsx       # App shell
│   └── PrivateRoute.jsx # Auth guard
├── contexts/
│   └── AuthContext.jsx  # Auth state
├── hooks/
│   └── useFirestore.js  # Real-time hooks
├── pages/
│   ├── Feed.jsx         # Posts feed
│   ├── Reels.jsx        # Video reels
│   ├── Messages.jsx     # Chat list
│   ├── ChatView.jsx     # Chat conversation
│   ├── Profile.jsx      # User profile
│   ├── Notifications.jsx
│   ├── Login.jsx
│   └── Signup.jsx
├── services/
│   └── notifications.js # Notification helper
├── styles/
│   ├── index.css        # Main styles
│   └── auth.css         # Auth styles
└── utils/
    └── formatTime.js    # Time formatter
```

## Deploy

```bash
npm run build  # outputs to dist/
```

Deploy `dist/` to Vercel, Netlify, or Firebase Hosting.

## License

MIT
