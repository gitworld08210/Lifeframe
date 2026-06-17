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
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) =>
      setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [currentUser]);

  async function handleSearch(value) {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    const snap = await getDocs(collection(db, 'users'));
    setSearchResults(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (u) =>
            u.uid !== currentUser.uid &&
            (u.displayName?.toLowerCase().includes(value.toLowerCase()) ||
              u.username?.toLowerCase().includes(value.toLowerCase()))
        )
    );
  }

  async function handleGroupSearch(value) {
    setGroupSearchQuery(value);
    if (!value.trim()) {
      setGroupSearchResults([]);
      return;
    }
    const snap = await getDocs(collection(db, 'users'));
    setGroupSearchResults(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter(
          (u) =>
            u.uid !== currentUser.uid &&
            !selectedMembers.find((m) => m.uid === u.uid) &&
            (u.displayName?.toLowerCase().includes(value.toLowerCase()) ||
              u.username?.toLowerCase().includes(value.toLowerCase()))
        )
    );
  }

  function addMember(user) {
    setSelectedMembers((prev) => [...prev, user]);
    setGroupSearchQuery('');
    setGroupSearchResults([]);
  }

  function removeMember(uid) {
    setSelectedMembers((prev) => prev.filter((m) => m.uid !== uid));
  }

  async function createGroupChat() {
    if (!groupName.trim() || selectedMembers.length < 2) return;
    setCreatingGroup(true);
    try {
      const participants = [currentUser.uid, ...selectedMembers.map((m) => m.uid)];
      const participantNames = {
        [currentUser.uid]: userProfile?.displayName || 'You',
      };
      const participantAvatars = {
        [currentUser.uid]: userProfile?.avatarUrl || '',
      };
      selectedMembers.forEach((m) => {
        participantNames[m.uid] = m.displayName || 'User';
        participantAvatars[m.uid] = m.avatarUrl || '';
      });

      const chatDoc = await addDoc(collection(db, 'chats'), {
        participants,
        participantNames,
        participantAvatars,
        isGroup: true,
        groupName: groupName.trim(),
        groupIcon: '',
        lastMessage: '',
        lastMessageAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });

      setShowGroupModal(false);
      setGroupName('');
      setSelectedMembers([]);
      navigate(`/messages/${chatDoc.id}`);
    } catch (err) {
      console.error('[Lifeframe] Error creating group:', err);
    } finally {
      setCreatingGroup(false);
    }
  }

  async function startChat(otherUser) {
    const existing = chats.find(
      (c) => !c.isGroup && c.participants.includes(otherUser.uid) && c.participants.length === 2
    );
    if (existing) {
      navigate(`/messages/${existing.id}`);
      return;
    }
    const chatDoc = await addDoc(collection(db, 'chats'), {
      participants: [currentUser.uid, otherUser.uid],
      participantNames: {
        [currentUser.uid]: userProfile?.displayName || 'You',
        [otherUser.uid]: otherUser.displayName || 'User',
      },
      participantAvatars: {
        [currentUser.uid]: userProfile?.avatarUrl || '',
        [otherUser.uid]: otherUser.avatarUrl || '',
      },
      isGroup: false,
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/messages/${chatDoc.id}`);
  }

  function getChatDisplay(chat) {
    if (chat.isGroup) {
      return {
        name: chat.groupName || 'Group Chat',
        avatar: chat.groupIcon || '',
        isGroup: true,
      };
    }
    const otherId = chat.participants.find((p) => p !== currentUser.uid);
    return {
      name: chat.participantNames?.[otherId] || 'User',
      avatar: chat.participantAvatars?.[otherId] || '',
      isGroup: false,
    };
  }

  function getUnreadCount(chat) {
    if (!chat.lastRead || !chat.lastRead[currentUser.uid]) return 0;
    // If lastMessageAt is after lastRead, show indicator
    const lastRead = chat.lastRead?.[currentUser.uid];
    const lastMsg = chat.lastMessageAt;
    if (!lastRead || !lastMsg) return 0;
    const readTime = lastRead.toDate ? lastRead.toDate() : new Date(lastRead);
    const msgTime = lastMsg.toDate ? lastMsg.toDate() : new Date(lastMsg);
    return msgTime > readTime ? 1 : 0;
  }

  return (
    <div className="messages-page">
      <div className="glass-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search users to message..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((user) => (
            <div key={user.uid} className="chat-item" onClick={() => startChat(user)}>
              <div className="chat-item-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" />
                ) : (
                  <div className="avatar-placeholder-chat">{user.displayName?.charAt(0)}</div>
                )}
              </div>
              <div className="chat-item-info">
                <h4>{user.displayName}</h4>
                <p>@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searchQuery && (
        <div className="chat-list">
          {chats.map((chat) => {
            const display = getChatDisplay(chat);
            const unread = getUnreadCount(chat);
            return (
              <div key={chat.id} className="chat-item" onClick={() => navigate(`/messages/${chat.id}`)}>
                <div className="chat-item-avatar" style={{ position: 'relative' }}>
                  {display.avatar ? (
                    <img src={display.avatar} alt="" />
                  ) : (
                    <div className="avatar-placeholder-chat">
                      {display.isGroup ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      ) : (
                        display.name?.charAt(0)
                      )}
                    </div>
                  )}
                  {/* Online status dot for 1:1 chats */}
                  {!display.isGroup && (
                    <div style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: 'var(--success)',
                      border: '2px solid var(--bg-primary)',
                    }} />
                  )}
                </div>
                <div className="chat-item-info">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {display.isGroup && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.7 }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    )}
                    {display.name}
                  </h4>
                  <p>{chat.lastMessage || 'No messages yet'}</p>
                </div>
                <div className="chat-item-meta">
                  <span className="time">{formatTime(chat.lastMessageAt)}</span>
                  {unread > 0 && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      marginTop: 4,
                    }}>
                      {unread}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {chats.length === 0 && (
            <div className="empty-state">
              <p>No conversations yet. Search for users!</p>
            </div>
          )}
        </div>
      )}

      {/* Floating Action Button */}
      <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 100 }}>
        {showFab && (
          <div className="glass-card" style={{
            position: 'absolute',
            bottom: 64,
            right: 0,
            padding: '0.5rem',
            minWidth: 180,
            marginBottom: 8,
          }}>
            <button
              className="glass-btn"
              style={{ width: '100%', textAlign: 'left', marginBottom: 4 }}
              onClick={() => { setShowFab(false); document.querySelector('.search-input')?.focus(); }}
            >
              New Chat
            </button>
            <button
              className="glass-btn"
              style={{ width: '100%', textAlign: 'left' }}
              onClick={() => { setShowFab(false); setShowGroupModal(true); }}
            >
              New Group
            </button>
          </div>
        )}
        <button
          className="glass-btn primary"
          onClick={() => setShowFab(!showFab)}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Group Chat Creation Modal */}
      {showGroupModal && (
        <div className="modal-backdrop" onClick={() => setShowGroupModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Create Group Chat</h3>

              <input
                type="text"
                className="glass-input"
                placeholder="Group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />

              {/* Selected members */}
              {selectedMembers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
                  {selectedMembers.map((m) => (
                    <span
                      key={m.uid}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 10px',
                        borderRadius: 16,
                        backgroundColor: 'rgba(var(--primary-rgb), 0.2)',
                        fontSize: '0.8rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {m.displayName}
                      <button
                        onClick={() => removeMember(m.uid)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: 0,
                          fontSize: '1rem',
                          lineHeight: 1,
                        }}
                      >
                        x
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <input
                type="text"
                className="glass-input"
                placeholder="Search users to add..."
                value={groupSearchQuery}
                onChange={(e) => handleGroupSearch(e.target.value)}
                style={{ marginBottom: '0.5rem' }}
              />

              {groupSearchResults.length > 0 && (
                <div style={{ maxHeight: 150, overflowY: 'auto', marginBottom: '1rem' }}>
                  {groupSearchResults.map((user) => (
                    <div
                      key={user.uid}
                      className="chat-item"
                      onClick={() => addMember(user)}
                      style={{ padding: '8px', cursor: 'pointer' }}
                    >
                      <div className="chat-item-avatar" style={{ width: 32, height: 32 }}>
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" />
                        ) : (
                          <div className="avatar-placeholder-chat" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                            {user.displayName?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="chat-item-info">
                        <h4 style={{ fontSize: '0.85rem' }}>{user.displayName}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: '1rem' }}>
                <button
                  className="glass-btn"
                  onClick={() => setShowGroupModal(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  className="glass-btn primary"
                  onClick={createGroupChat}
                  disabled={!groupName.trim() || selectedMembers.length < 2 || creatingGroup}
                  style={{ flex: 1 }}
                >
                  {creatingGroup ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
