export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'voice_note' | 'shared_post' | 'shared_reel';
  mediaUrl?: string;
  replyTo?: string;
  status: 'sent' | 'delivered' | 'seen';
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: {
    uid: string;
    username: string;
    displayName: string;
    avatarUrl: string;
  }[];
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
    type: Message['type'];
  } | null;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}
