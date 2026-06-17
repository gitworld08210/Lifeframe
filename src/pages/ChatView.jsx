import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../cloudinary';
import { formatTime } from '../utils/formatTime';
import {
  createPeerConnection,
  createCallDocument,
  setCallOffer,
  sendICECandidate,
  listenForCallUpdates,
  listenForICECandidates,
} from '../services/webrtc';

export default function ChatView() {
  const { chatId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Listen to chat document
  useEffect(() => {
    if (!chatId) return;
    const unsub = onSnapshot(doc(db, 'chats', chatId), (snap) => {
      if (snap.exists()) setChat({ id: snap.id, ...snap.data() });
    });
    return () => unsub();
  }, [chatId]);

  // Listen to messages
  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) =>
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [chatId]);

  // Listen to typing indicators
  useEffect(() => {
    if (!chatId || !currentUser) return;
    const unsub = onSnapshot(collection(db, 'chats', chatId, 'typing'), (snap) => {
      const typers = [];
      snap.docs.forEach((d) => {
        if (d.id !== currentUser.uid) {
          const data = d.data();
          // Only show typing if timestamp is within last 5 seconds
          if (data.timestamp) {
            const typingTime = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
            if (Date.now() - typingTime.getTime() < 5000) {
              typers.push(data.displayName || 'Someone');
            }
          }
        }
      });
      setTypingUsers(typers);
    });
    return () => unsub();
  }, [chatId, currentUser]);

  // Mark messages as read when chat is open
  useEffect(() => {
    if (!chatId || !currentUser) return;
    const updateLastRead = async () => {
      try {
        await updateDoc(doc(db, 'chats', chatId), {
          [`lastRead.${currentUser.uid}`]: serverTimestamp(),
        });
      } catch (err) {
        // Chat might not exist yet
      }
    };
    updateLastRead();
    // Also update when new messages arrive
    const interval = setInterval(updateLastRead, 3000);
    return () => clearInterval(interval);
  }, [chatId, currentUser, messages.length]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Typing indicator - write to Firestore
  function handleTyping() {
    if (!chatId || !currentUser) return;
    const typingRef = doc(db, 'chats', chatId, 'typing', currentUser.uid);
    setDoc(typingRef, {
      displayName: userProfile?.displayName || 'User',
      timestamp: Timestamp.now(),
    }).catch(() => {});

    // Clear typing after 3 seconds of no input
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      deleteDoc(typingRef).catch(() => {});
    }, 3000);
  }

  async function sendMessage() {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || 'You',
        text: newMessage.trim(),
        type: 'text',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: newMessage.trim(),
        lastMessageAt: serverTimestamp(),
      });
      setNewMessage('');
      // Clear typing indicator
      deleteDoc(doc(db, 'chats', chatId, 'typing', currentUser.uid)).catch(() => {});
    } catch (err) {
      console.error('[Lifeframe] Send message error:', err);
    } finally {
      setSending(false);
    }
  }

  async function sendImage(file) {
    if (!file || uploadingImage) return;
    setUploadingImage(true);
    try {
      const { url } = await uploadToCloudinary(file, 'lifeframe/messages');
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        senderId: currentUser.uid,
        senderName: userProfile?.displayName || 'You',
        text: '',
        imageUrl: url,
        type: 'image',
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: 'Sent an image',
        lastMessageAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('[Lifeframe] Image upload error:', err);
    } finally {
      setUploadingImage(false);
    }
  }

  async function initiateCall(type) {
    if (!chat || !currentUser) return;
    try {
      const recipientId = chat.participants.find((p) => p !== currentUser.uid);
      if (!recipientId) return;

      const callerInfo = {
        uid: currentUser.uid,
        displayName: userProfile?.displayName || 'User',
        avatarUrl: userProfile?.avatarUrl || '',
      };

      // Create the call document
      const callId = await createCallDocument(callerInfo, recipientId, type);

      // Set up WebRTC as caller
      const pc = createPeerConnection();

      // Get media stream
      const constraints = type === 'video'
        ? { video: true, audio: true }
        : { video: false, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendICECandidate(callId, event.candidate, 'caller');
        }
      };

      // Create and set offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await setCallOffer(callId, offer);

      // Listen for answer
      listenForCallUpdates(callId, async (callData) => {
        if (callData.answer && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(callData.answer));
        }
      });

      // Listen for callee ICE candidates
      listenForICECandidates(callId, 'callee', async (candidateData) => {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidateData));
        } catch (err) {
          console.error('[Lifeframe] Error adding callee ICE candidate:', err);
        }
      });

      // Navigate to the call page
      const route = type === 'video' ? `/call/video/${callId}` : `/call/voice/${callId}`;
      navigate(route);
    } catch (err) {
      console.error('[Lifeframe] Error initiating call:', err);
    }
  }

  function getChatName() {
    if (!chat) return 'Chat';
    if (chat.isGroup) return chat.groupName || 'Group Chat';
    const otherId = chat.participants?.find((p) => p !== currentUser.uid);
    return chat.participantNames?.[otherId] || 'User';
  }

  function getChatAvatar() {
    if (!chat) return '';
    if (chat.isGroup) return chat.groupIcon || '';
    const otherId = chat.participants?.find((p) => p !== currentUser.uid);
    return chat.participantAvatars?.[otherId] || '';
  }

  function isMessageRead(msg) {
    if (!chat || !chat.lastRead || msg.senderId !== currentUser.uid) return false;
    const otherIds = chat.participants?.filter((p) => p !== currentUser.uid) || [];
    return otherIds.some((uid) => {
      const lastRead = chat.lastRead?.[uid];
      if (!lastRead || !msg.createdAt) return false;
      const readTime = lastRead.toDate ? lastRead.toDate() : new Date(lastRead);
      const msgTime = msg.createdAt.toDate ? msg.createdAt.toDate() : new Date(msg.createdAt);
      return readTime >= msgTime;
    });
  }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button className="glass-icon-btn" onClick={() => navigate('/messages')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: chat?.isGroup ? 'pointer' : 'default' }}
          onClick={() => chat?.isGroup && setShowGroupMembers(!showGroupMembers)}
        >
          <div className="avatar-sm">
            {getChatAvatar() ? (
              <img src={getChatAvatar()} alt="" />
            ) : (
              <span>
                {chat?.isGroup ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ) : (
                  getChatName()?.charAt(0)
                )}
              </span>
            )}
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{getChatName()}</h3>
            {typingUsers.length > 0 ? (
              <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontStyle: 'italic' }}>
                {typingUsers.join(', ')} typing...
              </span>
            ) : (
              <span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>
                {chat?.isGroup ? `${chat.participants?.length || 0} members` : 'online'}
              </span>
            )}
          </div>
        </div>

        {/* Call buttons */}
        {!chat?.isGroup && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="glass-icon-btn" onClick={() => initiateCall('voice')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
            <button className="glass-icon-btn" onClick={() => initiateCall('video')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>
          </div>
        )}
        {chat?.isGroup && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="glass-icon-btn" onClick={() => initiateCall('voice')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
            <button className="glass-icon-btn" onClick={() => initiateCall('video')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Group members panel */}
      {showGroupMembers && chat?.isGroup && (
        <div className="glass-card" style={{ margin: '0 1rem', padding: '0.75rem' }}>
          <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Members</h4>
          {chat.participants?.map((uid) => (
            <div key={uid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <div className="avatar-sm" style={{ width: 28, height: 28 }}>
                {chat.participantAvatars?.[uid] ? (
                  <img src={chat.participantAvatars[uid]} alt="" />
                ) : (
                  <span style={{ fontSize: '0.7rem' }}>{chat.participantNames?.[uid]?.charAt(0) || '?'}</span>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                {chat.participantNames?.[uid] || 'User'}
                {uid === currentUser.uid && ' (you)'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}>
            {/* Show sender name in group chats */}
            {chat?.isGroup && msg.senderId !== currentUser.uid && (
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginBottom: 2, fontWeight: 600 }}>
                {msg.senderName}
              </div>
            )}
            {/* Image message */}
            {msg.type === 'image' && msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="Shared image"
                style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 4 }}
              />
            )}
            {/* Text content */}
            {msg.text && <span>{msg.text}</span>}
            <div className="message-time" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {formatTime(msg.createdAt)}
              {/* Read receipt */}
              {msg.senderId === currentUser.uid && (
                <span style={{ display: 'inline-flex' }}>
                  {isMessageRead(msg) ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <polyline points="2 12 7 17 12 12" />
                      <polyline points="12 12 17 17 22 12" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        {/* Image upload button */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.[0]) sendImage(e.target.files[0]);
            e.target.value = '';
          }}
        />
        <button
          className="glass-icon-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
        >
          {uploadingImage ? (
            <div style={{ width: 20, height: 20, border: '2px solid var(--text-secondary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          )}
        </button>

        <input
          type="text"
          className="glass-input"
          style={{ borderRadius: 24, flex: 1 }}
          placeholder="Message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button className="glass-icon-btn" onClick={sendMessage} disabled={!newMessage.trim() || sending}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
