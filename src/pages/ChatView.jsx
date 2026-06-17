import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, addDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatTime } from '../utils/formatTime';

export default function ChatView() {
  const { chatId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!chatId) return;
    const unsub = onSnapshot(doc(db, 'chats', chatId), (snap) => { if (snap.exists()) setChat({ id: snap.id, ...snap.data() }); });
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [chatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function sendMessage() {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), { senderId: currentUser.uid, senderName: userProfile?.displayName || 'You', text: newMessage.trim(), createdAt: serverTimestamp() });
      await updateDoc(doc(db, 'chats', chatId), { lastMessage: newMessage.trim(), lastMessageAt: serverTimestamp() });
      setNewMessage('');
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  }

  function getOtherName() { if (!chat) return 'Chat'; const otherId = chat.participants?.find((p) => p !== currentUser.uid); return chat.participantNames?.[otherId] || 'User'; }
  function getOtherAvatar() { if (!chat) return ''; const otherId = chat.participants?.find((p) => p !== currentUser.uid); return chat.participantAvatars?.[otherId] || ''; }

  return (
    <div className="chat-view">
      <div className="chat-header">
        <button className="glass-icon-btn" onClick={() => navigate('/messages')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div className="avatar-sm">{getOtherAvatar() ? <img src={getOtherAvatar()} alt="" /> : <span>{getOtherName()?.charAt(0)}</span>}</div>
          <div><h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{getOtherName()}</h3><span style={{ fontSize: '0.72rem', color: 'var(--success)' }}>online</span></div>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`}>
            {msg.text}
            <div className="message-time">{formatTime(msg.createdAt)}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <input type="text" className="glass-input" style={{ borderRadius: 24 }} placeholder="Message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
        <button className="glass-icon-btn" onClick={sendMessage} disabled={!newMessage.trim() || sending}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}
