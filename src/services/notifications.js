import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function createNotification(recipientId, { type, actorId, actorName, actorAvatar, postId, text }) {
  if (!recipientId || recipientId === actorId) return;

  const notificationsRef = collection(db, 'users', recipientId, 'notifications');

  await addDoc(notificationsRef, {
    type,
    actorId,
    actorName,
    actorAvatar: actorAvatar || '',
    postId: postId || null,
    text: text || '',
    read: false,
    createdAt: serverTimestamp(),
  });
}
