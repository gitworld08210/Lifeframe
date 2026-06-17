import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CreatorDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPostViews: 0,
    totalReelViews: 0,
    followersCount: 0,
    postsCount: 0,
    reelsCount: 0,
    totalLikes: 0,
    totalComments: 0,
    engagementRate: 0,
  });
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    async function fetchAnalytics() {
      setLoading(true);
      try {
        // Fetch posts
        const postsQuery = query(collection(db, 'posts'), where('authorId', '==', currentUser.uid));
        const postsSnap = await getDocs(postsQuery);
        const postsData = postsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        let totalPostViews = 0;
        let totalLikes = 0;
        let totalComments = 0;

        postsData.forEach((post) => {
          totalPostViews += post.views || 0;
          totalLikes += (post.likes?.length || 0);
          totalComments += post.commentCount || 0;
        });

        // Fetch reels
        const reelsQuery = query(collection(db, 'reels'), where('authorId', '==', currentUser.uid));
        const reelsSnap = await getDocs(reelsQuery);
        const reelsData = reelsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

        let totalReelViews = 0;
        reelsData.forEach((reel) => {
          totalReelViews += reel.views || 0;
          totalLikes += (reel.likes?.length || 0);
        });

        // Fetch followers count
        const followersRef = collection(db, 'users', currentUser.uid, 'followers');
        const followersSnap = await getCountFromServer(followersRef);
        const followersCount = followersSnap.data().count;

        // Top posts by likes
        const sorted = [...postsData].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 5);

        // Engagement rate
        const engagementRate = followersCount > 0
          ? (((totalLikes + totalComments) / followersCount) * 100).toFixed(1)
          : 0;

        setStats({
          totalPostViews,
          totalReelViews,
          followersCount,
          postsCount: postsData.length,
          reelsCount: reelsData.length,
          totalLikes,
          totalComments,
          engagementRate,
        });
        setTopPosts(sorted);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  const maxLikes = topPosts.length > 0 ? (topPosts[0].likes?.length || 1) : 1;

  return (
    <div className="dashboard-page">
      <div className="page-title-row">
        <button className="glass-icon-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="page-title">Creator Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="glass-card stat-card stat-card-views">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <div className="stat-value">{stats.totalPostViews.toLocaleString()}</div>
          <div className="stat-label">Post Views</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '75%' }} /></div>
        </div>

        <div className="glass-card stat-card stat-card-reels">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <div className="stat-value">{stats.totalReelViews.toLocaleString()}</div>
          <div className="stat-label">Reel Views</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '60%' }} /></div>
        </div>

        <div className="glass-card stat-card stat-card-followers">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-value">{stats.followersCount.toLocaleString()}</div>
          <div className="stat-label">Followers</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '50%' }} /></div>
        </div>

        <div className="glass-card stat-card stat-card-engagement">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
          </div>
          <div className="stat-value">{stats.engagementRate}%</div>
          <div className="stat-label">Engagement Rate</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${Math.min(stats.engagementRate, 100)}%` }} /></div>
        </div>

        <div className="glass-card stat-card stat-card-posts">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="stat-value">{stats.postsCount}</div>
          <div className="stat-label">Total Posts</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '80%' }} /></div>
        </div>

        <div className="glass-card stat-card stat-card-likes">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className="stat-value">{stats.totalLikes}</div>
          <div className="stat-label">Total Likes</div>
          <div className="stat-bar"><div className="stat-bar-fill" style={{ width: '65%' }} /></div>
        </div>
      </div>

      {topPosts.length > 0 && (
        <div className="glass-card top-posts-section">
          <h3 className="section-title">Top Posts by Likes</h3>
          <div className="top-posts-list">
            {topPosts.map((post, index) => (
              <div key={post.id} className="top-post-item">
                <span className="top-post-rank">#{index + 1}</span>
                <div className="top-post-info">
                  <p className="top-post-text">{post.content?.substring(0, 60)}{post.content?.length > 60 ? '...' : ''}</p>
                  <span className="top-post-likes">{post.likes?.length || 0} likes</span>
                </div>
                <div className="top-post-bar">
                  <div
                    className="top-post-bar-fill"
                    style={{ width: `${((post.likes?.length || 0) / maxLikes) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
