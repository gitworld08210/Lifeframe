import { useState, useEffect, useRef } from 'react';
import { collection, addDoc, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../cloudinary';
import { createNotification } from '../services/notifications';

export default function Reels() {
  const { currentUser, userProfile } = useAuth();
  const [reels, setReels] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => setReels(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  async function handleUpload() {
    if (!videoFile) return;
    setUploading(true);
    try {
      const result = await uploadToCloudinary(videoFile, 'glassverse/reels');
      await addDoc(collection(db, 'reels'), {
        authorId: currentUser.uid, authorName: userProfile?.displayName || 'User', authorAvatar: userProfile?.avatarUrl || '',
        videoUrl: result.url, caption: caption.trim(), likes: [], comments: [], shares: 0, createdAt: serverTimestamp(),
      });
      setShowUpload(false); setCaption(''); setVideoFile(null); setVideoPreview('');
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  }

  async function toggleLike(reel) {
    const isLiked = reel.likes?.includes(currentUser.uid);
    await updateDoc(doc(db, 'reels', reel.id), { likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid) });
    if (!isLiked && reel.authorId !== currentUser.uid) {
      createNotification(reel.authorId, { type: 'like', actorId: currentUser.uid, actorName: userProfile?.displayName, actorAvatar: userProfile?.avatarUrl, postId: reel.id, text: 'liked your reel' });
    }
  }

  return (
    <div className="reels-page-wrapper">
      <button className="reel-upload-btn glass-icon-btn" onClick={() => setShowUpload(true)}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      <div className="reels-container">
        {reels.map((reel) => (
          <div key={reel.id} className="reel-item">
            <video className="reel-video" src={reel.videoUrl} loop muted playsInline autoPlay onClick={(e) => { e.target.paused ? e.target.play() : e.target.pause(); }} />
            <div className="reel-overlay"><div className="reel-info"><h4>{reel.authorName}</h4><p>{reel.caption}</p></div></div>
            <div className="reel-actions">
              <div className="reel-avatar">{reel.authorAvatar ? <img src={reel.authorAvatar} alt="" /> : <div className="avatar-placeholder-sm">{reel.authorName?.charAt(0)}</div>}</div>
              <button className={`reel-action-btn ${reel.likes?.includes(currentUser.uid) ? 'liked' : ''}`} onClick={() => toggleLike(reel)}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill={reel.likes?.includes(currentUser.uid) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>{reel.likes?.length || 0}</span>
              </button>
              <button className="reel-action-btn">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <span>{reel.comments?.length || 0}</span>
              </button>
              <button className="reel-action-btn">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                <span>{reel.shares || 0}</span>
              </button>
            </div>
          </div>
        ))}
        {reels.length === 0 && <div className="reel-item reel-empty"><p>No reels yet. Upload the first one!</p></div>}
      </div>

      {showUpload && (
        <div className="modal" style={{ display: 'flex' }}>
          <div className="modal-backdrop" onClick={() => setShowUpload(false)} />
          <div className="modal-content glass-card">
            <div className="modal-header"><h3>Upload Reel</h3><button className="glass-icon-btn" onClick={() => setShowUpload(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
            {videoPreview ? <video src={videoPreview} className="upload-preview-video" controls /> : (
              <label className="upload-area">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m22 8-6 4 6 4V8Z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                <p>Tap to select a video</p>
                <input type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files[0]; if (f) { setVideoFile(f); setVideoPreview(URL.createObjectURL(f)); } }} />
              </label>
            )}
            <textarea className="glass-input" placeholder="Write a caption..." value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} style={{ marginTop: 12, borderRadius: 12 }} />
            <button className="glass-btn primary" style={{ width: '100%', marginTop: 12 }} onClick={handleUpload} disabled={!videoFile || uploading}>{uploading ? 'Uploading...' : 'Upload Reel'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
