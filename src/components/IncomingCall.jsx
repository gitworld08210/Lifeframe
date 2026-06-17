import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { rejectCall } from '../services/webrtc';

export default function IncomingCall() {
  const { currentUser } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'calls'),
      where('recipientId', '==', currentUser.uid),
      where('status', '==', 'ringing')
    );

    const unsub = onSnapshot(q, (snap) => {
      const calls = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // Show the most recent incoming call
      if (calls.length > 0) {
        setIncomingCall(calls[0]);
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsub();
  }, [currentUser]);

  function handleAccept() {
    if (!incomingCall) return;
    const route = incomingCall.type === 'video'
      ? `/call/video/${incomingCall.id}`
      : `/call/voice/${incomingCall.id}`;
    setIncomingCall(null);
    navigate(route);
  }

  async function handleReject() {
    if (!incomingCall) return;
    await rejectCall(incomingCall.id);
    setIncomingCall(null);
  }

  if (!incomingCall) return null;

  return (
    <div className="modal-backdrop" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ animation: 'slideUp 0.3s ease' }}>
        <div className="modal-content" style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="incoming-call-pulse">
            <div className="avatar-md" style={{ margin: '0 auto 1rem' }}>
              {incomingCall.callerAvatar ? (
                <img src={incomingCall.callerAvatar} alt="" />
              ) : (
                <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {incomingCall.callerName?.charAt(0) || '?'}
                </span>
              )}
            </div>
          </div>

          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {incomingCall.callerName}
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Incoming {incomingCall.type} call...
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <button
              className="glass-icon-btn"
              onClick={handleReject}
              style={{
                backgroundColor: 'var(--danger)',
                width: 56,
                height: 56,
                borderRadius: '50%',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
                <line x1="23" y1="1" x2="1" y2="23" />
              </svg>
            </button>
            <button
              className="glass-icon-btn"
              onClick={handleAccept}
              style={{
                backgroundColor: 'var(--success)',
                width: 56,
                height: 56,
                borderRadius: '50%',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
