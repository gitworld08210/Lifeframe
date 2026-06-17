import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Premium() {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const isPremium = userProfile?.isPremium === true;

  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      title: 'Verified Badge',
      description: 'Get a blue checkmark on your profile to show authenticity',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
      title: 'Premium Gold Ring',
      description: 'Animated gold gradient ring around your profile avatar',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      ),
      title: 'Priority in Search',
      description: 'Your profile appears higher in search results',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
      title: 'Exclusive Themes',
      description: 'Access to exclusive premium UI themes and customizations',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
        </svg>
      ),
      title: 'Creator Analytics',
      description: 'Full access to the Creator Dashboard with detailed insights',
    },
  ];

  async function togglePremium() {
    setToggling(true);
    try {
      const newValue = !isPremium;
      await updateDoc(doc(db, 'users', currentUser.uid), { isPremium: newValue });
      if (updateUserProfile) {
        updateUserProfile({ isPremium: newValue });
      }
    } catch (err) {
      console.error('Error toggling premium:', err);
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="premium-page">
      <div className="page-title-row">
        <button className="glass-icon-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="page-title">Lifeframe Premium</h1>
      </div>

      {isPremium && (
        <div className="glass-card premium-status-card">
          <div className="premium-badge">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Premium Active</span>
          </div>
          <p>You are enjoying all premium features</p>
        </div>
      )}

      <div className="glass-card premium-features-card">
        <h3 className="section-title">Premium Features</h3>
        <div className="premium-feature-list">
          {features.map((feature, index) => (
            <div key={index} className="premium-feature-item">
              <div className="premium-feature-icon">{feature.icon}</div>
              <div className="premium-feature-info">
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
              {isPremium && (
                <div className="premium-feature-check">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="premium-action-section">
        <button
          className={`glass-btn ${isPremium ? '' : 'primary'} full-width premium-toggle-btn`}
          onClick={togglePremium}
          disabled={toggling}
        >
          {toggling ? 'Processing...' : isPremium ? 'Deactivate Premium' : 'Activate Premium'}
        </button>
        {!isPremium && (
          <p className="premium-note">Premium features will be activated instantly on your account.</p>
        )}
      </div>

      <div className="glass-card settings-section">
        <h3 className="section-title">Premium Settings</h3>
        <p className="settings-placeholder">Payment integration and billing settings will be available in a future update.</p>
      </div>
    </div>
  );
}
