import { useState, useEffect } from 'react';
import {
  collection, addDoc, doc, updateDoc, deleteDoc,
  arrayUnion, arrayRemove, query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../cloudinary';
import { createNotification } from '../services/notifications';
import { formatTime } from '../utils/formatTime';

export default function Feed() {
  const { currentUser, userProfile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubs = [];
    Object.keys(showComments).forEach((postId) => {
      if (showComments[postId]) {
        const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
        unsubs.push(onSnapshot(q, (snap) => {
          setComments((prev) => ({ ...prev, [postId]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }));
        }));
      }
    });
    return () => unsubs.forEach((u) => u());
  }, [showComments]);

  async function handlePost() {
    if (!newPost.trim() && !imageFile) return;
    setPosting(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const result = await uploadToCloudinary(imageFile, 'glassverse/posts');
        imageUrl = result.url;
      }
      await addDoc(collection(db, 'posts'), {
        authorId: currentUser.uid,
        authorName: userProfile?.displayName || 'User',
        authorUsername: userProfile?.username || '',
        authorAvatar: userProfile?.avatarUrl || '',
        content: newPost.trim(),
        imageUrl,
        likes: [],
        reposts: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
      setNewPost(''); setImageFile(null); setImagePreview('');
    } catch (err) { console.error(err); }
    finally { setPosting(false); }
  }

  async function toggleLike(post) {
    const isLiked = post.likes?.includes(currentUser.uid);
    await updateDoc(doc(db, 'posts', post.id), {
      likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
    });
    if (!isLiked && post.authorId !== currentUser.uid) {
      createNotification(post.authorId, { type: 'like', actorId: currentUser.uid, actorName: userProfile?.displayName, actorAvatar: userProfile?.avatarUrl, postId: post.id, text: post.content?.slice(0, 50) });
    }
  }

  async function toggleRepost(post) {
    const isReposted = post.reposts?.includes(currentUser.uid);
    await updateDoc(doc(db, 'posts', post.id), {
      reposts: isReposted ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
    });
  }

  async function addComment(postId, authorId) {
    const text = commentText[postId]?.trim();
    if (!text) return;
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      authorId: currentUser.uid, authorName: userProfile?.displayName || 'User', authorAvatar: userProfile?.avatarUrl || '', text, createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, 'posts', postId), { commentCount: (posts.find((p) => p.id === postId)?.commentCount || 0) + 1 });
    if (authorId !== currentUser.uid) {
      createNotification(authorId, { type: 'comment', actorId: currentUser.uid, actorName: userProfile?.displayName, actorAvatar: userProfile?.avatarUrl, postId, text });
    }
    setCommentText((prev) => ({ ...prev, [postId]: '' }));
  }

  return (
    <div className="feed-page">
      <div className="glass-card create-post">
        <div className="create-post-header">
          <div className="avatar-md">
            {userProfile?.avatarUrl ? <img src={userProfile.avatarUrl} alt="" /> : <div className="avatar-placeholder">{userProfile?.displayName?.charAt(0) || 'U'}</div>}
          </div>
          <textarea className="glass-input composer-textarea" placeholder="What's happening?" value={newPost} onChange={(e) => setNewPost(e.target.value)} rows={2} />
        </div>
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button className="remove-preview" onClick={() => { setImageFile(null); setImagePreview(''); }}>&times;</button>
          </div>
        )}
        <div className="create-post-actions">
          <label className="glass-btn-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg> Photo
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); } }} />
          </label>
          <div style={{ flex: 1 }} />
          <button className="glass-btn primary" onClick={handlePost} disabled={posting || (!newPost.trim() && !imageFile)}>{posting ? 'Posting...' : 'Post'}</button>
        </div>
      </div>

      {posts.map((post) => (
        <div key={post.id} className="glass-card feed-post">
          <div className="post-header">
            <div className="avatar-md">{post.authorAvatar ? <img src={post.authorAvatar} alt="" /> : <div className="avatar-placeholder">{post.authorName?.charAt(0)}</div>}</div>
            <div className="post-author"><h4>{post.authorName}</h4><span>@{post.authorUsername} · {formatTime(post.createdAt)}</span></div>
            {post.authorId === currentUser.uid && (
              <button className="glass-icon-btn" style={{ width: 30, height: 30 }} onClick={() => { if (window.confirm('Delete?')) deleteDoc(doc(db, 'posts', post.id)); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            )}
          </div>
          {post.content && <p className="post-content">{post.content}</p>}
          {post.imageUrl && <img src={post.imageUrl} alt="" className="post-image" />}
          <div className="post-actions">
            <button className={`post-action-btn ${post.likes?.includes(currentUser.uid) ? 'liked' : ''}`} onClick={() => toggleLike(post)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={post.likes?.includes(currentUser.uid) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {post.likes?.length || 0}
            </button>
            <button className="post-action-btn" onClick={() => setShowComments((p) => ({ ...p, [post.id]: !p[post.id] }))}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              {post.commentCount || 0}
            </button>
            <button className={`post-action-btn ${post.reposts?.includes(currentUser.uid) ? 'retweeted' : ''}`} onClick={() => toggleRepost(post)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              {post.reposts?.length || 0}
            </button>
          </div>
          {showComments[post.id] && (
            <div className="comments-section">
              {comments[post.id]?.map((c) => (
                <div key={c.id} className="comment-item">
                  <div className="avatar-sm">{c.authorAvatar ? <img src={c.authorAvatar} alt="" /> : <span>{c.authorName?.charAt(0)}</span>}</div>
                  <div className="comment-body"><strong>{c.authorName}</strong><p>{c.text}</p><span className="comment-time">{formatTime(c.createdAt)}</span></div>
                </div>
              ))}
              <div className="comment-input-row">
                <input className="glass-input" placeholder="Write a comment..." value={commentText[post.id] || ''} onChange={(e) => setCommentText((p) => ({ ...p, [post.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === 'Enter') addComment(post.id, post.authorId); }} />
                <button className="glass-icon-btn" onClick={() => addComment(post.id, post.authorId)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      {posts.length === 0 && <div className="empty-state"><p>No posts yet. Be the first to share!</p></div>}
    </div>
  );
}
