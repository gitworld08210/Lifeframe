import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { formatTime } from '../utils/formatTime';

export default function Notifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'notifications'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [currentUser]);

  function handleClick(notif) {
    updateDoc(doc(db, 'users', currentUser.uid, 'notifications', notif.id), { read: true });
    if (notif.type === 'follow') navigate(`/profile/${notif.actorId}`);
    else navigate('/');
  }

  function getNotifText(notif) {
    switch (notif.type) {
      case 'like': return 'liked your post';
      case 'comment': return `commented: "${notif.text}"`;
      case 'follow': return 'started following you';
      default: return 'interacted with your content';
    }
  }

  return (
    <div className="notifications-page">
      <h2 className="page-title">Notifications</h2>
      {notifications.length === 0 && <div className="empty-state"><p>No notifications yet</p></div>}
      <div className="notifications-list">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notification-item glass-card ${!notif.read ? 'unread' : ''}`} onClick={() => handleClick(notif)}>
            <div className="notif-avatar">
              {notif.actorAvatar ? <img src={notif.actorAvatar} alt="" /> : <div className="avatar-placeholder-sm">{notif.actorName?.charAt(0)}</div>}
            </div>
            <div className="notif-content"><p><strong>{notif.actorName}</strong> {getNotifText(notif)}</p><span className="notif-time">{formatTime(notif.createdAt)}</span></div>
            {!notif.read && <div className="notif-unread-dot" />}
          </div>
        ))}
      </div>
    </div>
  );
}
