import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatTime } from '../utils/formatTime';

export default function Messages() {
  const { currentUser, userProfile } = useAuth();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid), orderBy('lastMessageAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [currentUser]);

  async function handleSearch(value) {
    setSearchQuery(value);
    if (!value.trim()) { setSearchResults([]); return; }
    const snap = await getDocs(collection(db, 'users'));
    setSearchResults(snap.docs.map((d) => ({ id: d.id, ...d.data() })).filter((u) => u.uid !== currentUser.uid && (u.displayName?.toLowerCase().includes(value.toLowerCase()) || u.username?.toLowerCase().includes(value.toLowerCase()))));
  }

  async function startChat(otherUser) {
    const existing = chats.find((c) => c.participants.includes(otherUser.uid) && c.participants.length === 2);
    if (existing) { navigate(`/messages/${existing.id}`); return; }
    const chatDoc = await addDoc(collection(db, 'chats'), {
      participants: [currentUser.uid, otherUser.uid],
      participantNames: { [currentUser.uid]: userProfile?.displayName || 'You', [otherUser.uid]: otherUser.displayName || 'User' },
      participantAvatars: { [currentUser.uid]: userProfile?.avatarUrl || '', [otherUser.uid]: otherUser.avatarUrl || '' },
      lastMessage: '', lastMessageAt: serverTimestamp(), createdAt: serverTimestamp(),
    });
    setSearchQuery(''); setSearchResults([]);
    navigate(`/messages/${chatDoc.id}`);
  }

  function getOther(chat) {
    const otherId = chat.participants.find((p) => p !== currentUser.uid);
    return { name: chat.participantNames?.[otherId] || 'User', avatar: chat.participantAvatars?.[otherId] || '' };
  }

  return (
    <div className="messages-page">
      <div className="glass-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search users to message..." className="search-input" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
      </div>
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((user) => (
            <div key={user.uid} className="chat-item" onClick={() => startChat(user)}>
              <div className="chat-item-avatar">{user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : <div className="avatar-placeholder-chat">{user.displayName?.charAt(0)}</div>}</div>
              <div className="chat-item-info"><h4>{user.displayName}</h4><p>@{user.username}</p></div>
            </div>
          ))}
        </div>
      )}
      {!searchQuery && (
        <div className="chat-list">
          {chats.map((chat) => { const other = getOther(chat); return (
            <div key={chat.id} className="chat-item" onClick={() => navigate(`/messages/${chat.id}`)}>
              <div className="chat-item-avatar">{other.avatar ? <img src={other.avatar} alt="" /> : <div className="avatar-placeholder-chat">{other.name?.charAt(0)}</div>}</div>
              <div className="chat-item-info"><h4>{other.name}</h4><p>{chat.lastMessage || 'No messages yet'}</p></div>
              <div className="chat-item-meta"><span className="time">{formatTime(chat.lastMessageAt)}</span></div>
            </div>
          ); })}
          {chats.length === 0 && <div className="empty-state"><p>No conversations yet. Search for users!</p></div>}
        </div>
      )}
    </div>
  );
}
