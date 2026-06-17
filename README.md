# Lifeframe
# GlassVerse - Social Media App 

A modern social media platform with an iOS-inspired **Liquid Glass UI**. Combines Instagram-style Reels, Twitter/X-style Feed, and WhatsApp-style Messaging into one beautiful mobile-first experience.

Built with **React 18 + Firebase + Cloudinary**.

## Features

### Core
- **Authentication** - Email/password signup, login, password reset (Firebase Auth)
- **Feed** - X-style posts with text and images, likes, comments, reposts
- **Reels** - Instagram-style vertical video reels with upload, likes, and views
- **Messaging** - Real-time 1:1 and group chats with typing indicators, image sending, and read receipts
- **Voice/Video Calls** - WebRTC-based calling with in-app notifications

### Social
- **Follow System** - Follow/unfollow users with follower/following counts
- **Notifications** - Real-time notifications for likes, comments, follows, and messages
- **Profiles** - Editable profiles with avatar, cover photo, bio, and posts/reels grid
- **Search** - Discover users by name or username

### Premium
- **Creator Dashboard** - Analytics with post views, reel views, engagement rate, and top posts
- **Verification** - Request verification with ID upload, category selection, and status tracking
- **Lifeframe Premium** - Premium badge, animated gold profile ring, priority search, exclusive themes

### Design
- **Liquid Glass UI** - Glassmorphism cards with backdrop-filter blur and animated gradients
- **Dark Theme** - Elegant dark mode with floating gradient orbs
- **Mobile-First** - Optimized for mobile with 480px max-width layout
- **Smooth Animations** - CSS transitions and keyframe animations throughout

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite 5 | Build tool and dev server |
| Firebase Auth | User authentication |
| Cloud Firestore | Real-time database |
| Firebase Storage | File storage (backup) |
| Cloudinary | Image and video CDN/upload |
| React Router 6 | Client-side routing |
| WebRTC | Voice and video calling |

## Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd social-glass

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your Firebase and Cloudinary credentials

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click the web icon (</>) to add a web app
4. Copy the config values to your `.env` file

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. (Optional) Add authorized domains for your deployment URL

### 3. Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Start in **test mode** for development (apply security rules before production)
3. Choose a region close to your users

### 4. Required Firestore Indexes

Create these composite indexes in Firestore:

| Collection | Fields | Order |
|-----------|--------|-------|
| `posts` | `authorId` (Asc) + `createdAt` (Desc) | - |
| `reels` | `authorId` (Asc) + `createdAt` (Desc) | - |
| `chats` | `participants` (Array) + `lastMessageAt` (Desc) | - |

### 5. Firestore Security Rules

Deploy these rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      match /followers/{followerId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
      match /following/{followingId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null;
      }
      match /notifications/{notifId} {
        allow read: if request.auth.uid == userId;
        allow write: if request.auth != null;
      }
    }

    // Posts
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
      match /comments/{commentId} {
        allow read, write: if request.auth != null;
      }
    }

    // Reels
    match /reels/{reelId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.authorId;
    }

    // Chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null
        && request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }

    // Calls
    match /calls/{callId} {
      allow read, write: if request.auth != null;
    }

    // Verification Requests
    match /verificationRequests/{reqId} {
      allow read: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

## Cloudinary Setup

### 1. Create Account

1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Note your **Cloud Name** from the dashboard header

### 2. Create Upload Preset

1. Go to **Settings** > **Upload**
2. Scroll to **Upload presets** > **Add upload preset**
3. Set **Signing Mode** to **Unsigned**
4. Set **Folder** to `lifeframe` (optional)
5. Save and copy the **preset name** to your `.env` file

### 3. Configure Environment

Add to your `.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub
2. Click **New Project** > Import your repository
3. Framework Preset: **Vite**
4. Add environment variables (all `VITE_*` variables from your `.env`)
5. Click **Deploy**

### 3. Post-Deploy

- Add your Vercel domain to Firebase **Authentication** > **Authorized domains**
- Update Cloudinary CORS settings if needed

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth domain | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket | Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Yes |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset | Yes |

## Project Structure

```
src/
├── App.jsx                  # Routes and app structure
├── firebase.js              # Firebase initialization
├── cloudinary.js            # Cloudinary upload utility
├── main.jsx                 # Entry point
├── components/
│   ├── Layout.jsx           # App shell with nav and menu drawer
│   ├── PrivateRoute.jsx     # Auth guard
│   ├── ErrorBoundary.jsx    # Error boundary wrapper
│   └── IncomingCall.jsx     # Call notification overlay
├── contexts/
│   └── AuthContext.jsx      # Authentication state and methods
├── hooks/
│   └── useFirestore.js      # Real-time Firestore hooks
├── pages/
│   ├── Feed.jsx             # Posts feed
│   ├── Reels.jsx            # Video reels
│   ├── Search.jsx           # User search/discover
│   ├── Messages.jsx         # Chat list
│   ├── ChatView.jsx         # Chat conversation
│   ├── Profile.jsx          # User profile with stats
│   ├── FollowersList.jsx    # Followers list
│   ├── FollowingList.jsx    # Following list
│   ├── CreatorDashboard.jsx # Analytics dashboard
│   ├── Verification.jsx     # Verification request
│   ├── Premium.jsx          # Premium features
│   ├── Notifications.jsx    # Notifications list
│   ├── VideoCall.jsx        # Video call UI
│   ├── VoiceCall.jsx        # Voice call UI
│   ├── Login.jsx            # Login page
│   ├── Signup.jsx           # Signup page
│   └── ForgotPassword.jsx   # Password reset
├── services/
│   ├── notifications.js     # Notification creation helper
│   └── webrtc.js            # WebRTC signaling utilities
├── styles/
│   ├── index.css            # Main liquid glass styles
│   └── auth.css             # Authentication page styles
└── utils/
    └── formatTime.js        # Timestamp formatter
```

## Firestore Collections

| Collection | Description |
|-----------|-------------|
| `users` | User profiles (displayName, username, bio, avatarUrl, coverUrl, isVerified, isPremium) |
| `users/{uid}/followers` | Follower subcollection |
| `users/{uid}/following` | Following subcollection |
| `users/{uid}/notifications` | User notifications |
| `posts` | Feed posts with content, images, likes, comments |
| `reels` | Video reels with metadata and engagement |
| `chats` | Chat rooms with participants |
| `chats/{id}/messages` | Chat messages |
| `calls` | WebRTC call signaling documents |
| `verificationRequests` | Verification request submissions |

## License

MIT
