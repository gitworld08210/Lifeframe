import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function FollowersList() {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followStates, setFollowStates] = useState({});

  useEffect(() => {
    async function fetchFollowers() {
      setLoading(true);
      try {
        const followersSnap = await getDocs(collection(db, 'users', userId, 'followers'));
        const followerIds = followersSnap.docs.map((d) => d.id);

        const profiles = await Promise.all(
          followerIds.map(async (uid) => {
            const userSnap = await getDoc(doc(db, 'users', uid));
            if (userSnap.exists()) {
              return { uid, ...userSnap.data() };
            }
            return null;
          })
        );

        setFollowers(profiles.filter(Boolean));

        // Check follow states for current user
        if (currentUser) {
          const states = {};
          await Promise.all(
            followerIds.map(async (uid) => {
              if (uid === currentUser.uid) return;
              const followSnap = await getDoc(doc(db, 'users', currentUser.uid, 'following', uid));
              states[uid] = followSnap.exists();
            })
          );
          setFollowStates(states);
        }
      } catch (err) {
        console.error('Error fetching followers:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFollowers();
  }, [userId, currentUser]);

  async function toggleFollow(targetUid) {
    if (!currentUser || targetUid === currentUser.uid) return;
    const isCurrentlyFollowing = followStates[targetUid];

    try {
      if (isCurrentlyFollowing) {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'following', targetUid));
        await deleteDoc(doc(db, 'users', targetUid, 'followers', currentUser.uid));
        await updateDoc(doc(db, 'users', currentUser.uid), { following: increment(-1) });
        await updateDoc(doc(db, 'users', targetUid), { followers: increment(-1) });
      } else {
        await setDoc(doc(db, 'users', currentUser.uid, 'following', targetUid), { followedAt: new Date() });
        await setDoc(doc(db, 'users', targetUid, 'followers', currentUser.uid), { followedAt: new Date() });
        await updateDoc(doc(db, 'users', currentUser.uid), { following: increment(1) });
        await updateDoc(doc(db, 'users', targetUid), { followers: increment(1) });
      }
      setFollowStates((prev) => ({ ...prev, [targetUid]: !isCurrentlyFollowing }));
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="followers-page">
      <div className="page-title-row">
        <button className="glass-icon-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="page-title">Followers</h1>
      </div>

      <div className="followers-list">
        {followers.map((user) => (
          <div key={user.uid} className="glass-card follower-item">
            <div className="follower-avatar" onClick={() => navigate(`/profile/${user.uid}`)}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" />
              ) : (
                <div className="avatar-placeholder">{user.displayName?.charAt(0) || '?'}</div>
              )}
            </div>
            <div className="follower-info" onClick={() => navigate(`/profile/${user.uid}`)}>
              <h4>{user.displayName}</h4>
              <span>@{user.username}</span>
            </div>
            {currentUser && user.uid !== currentUser.uid && (
              <button
                className={`glass-btn ${followStates[user.uid] ? '' : 'primary'}`}
                onClick={() => toggleFollow(user.uid)}
              >
                {followStates[user.uid] ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        ))}
        {followers.length === 0 && (
          <div className="empty-state">
            <p>No followers yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
