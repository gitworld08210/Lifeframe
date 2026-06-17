import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../cloudinary';
import { createNotification } from '../services/notifications';
import { formatTime } from '../utils/formatTime';

export default function Profile() {
  const { userId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeTab, setActiveTab] = useState('posts');
  const [uploading, setUploading] = useState(false);
  const isOwn = currentUser?.uid === userId;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) { setProfile(snap.data()); setEditData(snap.data()); }
      setLoading(false);
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!currentUser || isOwn) return;
    getDoc(doc(db, 'users', currentUser.uid, 'following', userId)).then((s) => setIsFollowing(s.exists()));
  }, [currentUser, userId, isOwn]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), where('authorId', '==', userId), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, [userId]);

  async function handleFollow() {
    if (isFollowing) {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'following', userId));
      await deleteDoc(doc(db, 'users', userId, 'followers', currentUser.uid));
      await updateDoc(doc(db, 'users', currentUser.uid), { following: increment(-1) });
      await updateDoc(doc(db, 'users', userId), { followers: increment(-1) });
      setIsFollowing(false);
      setProfile((p) => ({ ...p, followers: (p.followers || 1) - 1 }));
    } else {
      await setDoc(doc(db, 'users', currentUser.uid, 'following', userId), { followedAt: new Date() });
      await setDoc(doc(db, 'users', userId, 'followers', currentUser.uid), { followedAt: new Date() });
      await updateDoc(doc(db, 'users', currentUser.uid), { following: increment(1) });
      await updateDoc(doc(db, 'users', userId), { followers: increment(1) });
      setIsFollowing(true);
      setProfile((p) => ({ ...p, followers: (p.followers || 0) + 1 }));
      createNotification(userId, { type: 'follow', actorId: currentUser.uid, actorName: userProfile?.displayName, actorAvatar: userProfile?.avatarUrl });
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const r = await uploadToCloudinary(file, 'glassverse/avatars'); await updateDoc(doc(db, 'users', currentUser.uid), { avatarUrl: r.url }); setProfile((p) => ({ ...p, avatarUrl: r.url })); }
    catch (err) { console.error(err); } finally { setUploading(false); }
  }

  async function handleCoverUpload(e) {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const r = await uploadToCloudinary(file, 'glassverse/covers'); await updateDoc(doc(db, 'users', currentUser.uid), { coverUrl: r.url }); setProfile((p) => ({ ...p, coverUrl: r.url })); }
    catch (err) { console.error(err); } finally { setUploading(false); }
  }

  async function saveProfile() {
    await updateDoc(doc(db, 'users', currentUser.uid), { displayName: editData.displayName, bio: editData.bio, username: editData.username });
    setProfile((p) => ({ ...p, ...editData }));
    setEditing(false);
  }

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!profile) return <div className="empty-state"><p>User not found</p></div>;

  return (
    <div className="profile-page">
      <div className="glass-card profile-header">
        <div className="profile-cover">
          {profile.coverUrl ? <img src={profile.coverUrl} alt="" /> : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--accent), #ec4899)' }} />}
          {isOwn && <label className="cover-upload-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} /></label>}
        </div>
        <div className="profile-info">
          <div className="profile-avatar" style={{ position: 'relative' }}>
            {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : <div className="avatar-placeholder-lg">{profile.displayName?.charAt(0)}</div>}
            {isOwn && <label className="avatar-upload-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg><input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} /></label>}
          </div>
          {editing ? (
            <div className="edit-profile-form">
              <input className="glass-input" value={editData.displayName || ''} onChange={(e) => setEditData((d) => ({ ...d, displayName: e.target.value }))} placeholder="Display Name" />
              <input className="glass-input" value={editData.username || ''} onChange={(e) => setEditData((d) => ({ ...d, username: e.target.value }))} placeholder="Username" />
              <textarea className="glass-input" value={editData.bio || ''} onChange={(e) => setEditData((d) => ({ ...d, bio: e.target.value }))} placeholder="Bio" rows={3} />
              <div className="profile-actions"><button className="glass-btn primary" onClick={saveProfile}>Save</button><button className="glass-btn" onClick={() => setEditing(false)}>Cancel</button></div>
            </div>
          ) : (
            <>
              <h2>{profile.displayName}</h2>
              <p className="profile-handle">@{profile.username}</p>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
              <div className="profile-stats">
                <div className="stat"><strong>{posts.length}</strong><span>Posts</span></div>
                <div className="stat"><strong>{profile.followers || 0}</strong><span>Followers</span></div>
                <div className="stat"><strong>{profile.following || 0}</strong><span>Following</span></div>
              </div>
              <div className="profile-actions">
                {isOwn ? <button className="glass-btn primary" onClick={() => setEditing(true)}>Edit Profile</button> : <button className={`glass-btn ${isFollowing ? '' : 'primary'}`} onClick={handleFollow}>{isFollowing ? 'Unfollow' : 'Follow'}</button>}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="profile-tabs glass-card">
        <button className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Posts</button>
        <button className={`tab-btn ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>Media</button>
      </div>

      {activeTab === 'posts' && (
        <div className="profile-posts-list">
          {posts.map((post) => (
            <div key={post.id} className="glass-card feed-post">
              <p className="post-content">{post.content}</p>
              {post.imageUrl && <img src={post.imageUrl} alt="" className="post-image" />}
              <div className="post-meta-row"><span>{post.likes?.length || 0} likes</span><span>{post.commentCount || 0} comments</span><span>{formatTime(post.createdAt)}</span></div>
            </div>
          ))}
          {posts.length === 0 && <div className="empty-state"><p>No posts yet</p></div>}
        </div>
      )}
      {activeTab === 'media' && (
        <div className="profile-grid">
          {posts.filter((p) => p.imageUrl).map((post) => <div key={post.id} className="profile-grid-item"><img src={post.imageUrl} alt="" /></div>)}
          {posts.filter((p) => p.imageUrl).length === 0 && <div className="empty-state"><p>No media</p></div>}
        </div>
      )}
      {uploading && <div className="upload-overlay"><div className="loading-spinner" /><p>Uploading...</p></div>}
    </div>
  );
}
