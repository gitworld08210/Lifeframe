import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { uploadToCloudinary } from '../cloudinary';
import { useNavigate } from 'react-router-dom';

export default function Verification() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    category: 'Creator',
    socialLinks: '',
  });
  const [idFile, setIdFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    async function checkExisting() {
      try {
        const q = query(
          collection(db, 'verificationRequests'),
          where('userId', '==', currentUser.uid)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          setExistingRequest({ id: doc.id, ...doc.data() });
        }
      } catch (err) {
        console.error('Error checking verification status:', err);
      } finally {
        setLoading(false);
      }
    }

    checkExisting();
  }, [currentUser]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    setSubmitting(true);
    try {
      let idDocumentUrl = null;
      if (idFile) {
        const result = await uploadToCloudinary(idFile, 'lifeframe/verification');
        idDocumentUrl = result.url;
      }

      await addDoc(collection(db, 'verificationRequests'), {
        userId: currentUser.uid,
        fullName: formData.fullName.trim(),
        category: formData.category,
        socialLinks: formData.socialLinks.split(',').map((s) => s.trim()).filter(Boolean),
        idDocumentUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      setExistingRequest({
        status: 'pending',
        fullName: formData.fullName.trim(),
        category: formData.category,
      });
    } catch (err) {
      console.error('Error submitting verification request:', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Already verified
  if (userProfile?.isVerified) {
    return (
      <div className="verification-page">
        <div className="page-title-row">
          <button className="glass-icon-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="page-title">Verification</h1>
        </div>
        <div className="glass-card verification-status">
          <div className="verification-badge-large">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>Already Verified</h2>
          <p>Your account has been verified. The verified badge is displayed on your profile.</p>
        </div>
      </div>
    );
  }

  // Existing request
  if (existingRequest) {
    const statusColors = {
      pending: 'var(--warning)',
      approved: 'var(--success)',
      rejected: 'var(--danger)',
    };

    return (
      <div className="verification-page">
        <div className="page-title-row">
          <button className="glass-icon-btn" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="page-title">Verification</h1>
        </div>
        <div className="glass-card verification-status">
          <h3>Verification Request Submitted</h3>
          <div className="status-badge" style={{ color: statusColors[existingRequest.status] }}>
            Status: {existingRequest.status.charAt(0).toUpperCase() + existingRequest.status.slice(1)}
          </div>
          <p className="status-detail">
            {existingRequest.status === 'pending' && 'Your request is being reviewed. This may take a few days.'}
            {existingRequest.status === 'approved' && 'Congratulations! Your verification has been approved.'}
            {existingRequest.status === 'rejected' && 'Unfortunately, your request was not approved at this time.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="verification-page">
      <div className="page-title-row">
        <button className="glass-icon-btn" onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="page-title">Get Verified</h1>
      </div>

      <div className="glass-card verification-form">
        <p className="form-description">
          Apply for a verified badge to let people know your account is authentic.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="glass-input"
              value={formData.fullName}
              onChange={(e) => setFormData((d) => ({ ...d, fullName: e.target.value }))}
              placeholder="Your legal full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="glass-input glass-select"
              value={formData.category}
              onChange={(e) => setFormData((d) => ({ ...d, category: e.target.value }))}
            >
              <option value="Creator">Creator</option>
              <option value="Brand">Brand</option>
              <option value="Public Figure">Public Figure</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Social Media Links</label>
            <input
              className="glass-input"
              value={formData.socialLinks}
              onChange={(e) => setFormData((d) => ({ ...d, socialLinks: e.target.value }))}
              placeholder="instagram.com/you, twitter.com/you (comma-separated)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">ID Document (optional)</label>
            <div className="file-upload-area">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setIdFile(e.target.files[0])}
                id="id-upload"
                style={{ display: 'none' }}
              />
              <label htmlFor="id-upload" className="glass-btn">
                {idFile ? idFile.name : 'Choose File'}
              </label>
            </div>
          </div>

          <button className="glass-btn primary full-width" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Verification Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
