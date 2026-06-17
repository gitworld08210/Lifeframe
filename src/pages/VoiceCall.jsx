import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  createPeerConnection,
  listenForCallUpdates,
  sendICECandidate,
  listenForICECandidates,
  setCallAnswer,
  endCall,
} from '../services/webrtc';

export default function VoiceCall() {
  const { callId: paramCallId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [callStatus, setCallStatus] = useState('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteName, setRemoteName] = useState('');
  const [remoteAvatar, setRemoteAvatar] = useState('');

  const remoteAudioRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);
  const unsubCallRef = useRef(null);
  const unsubCandidatesRef = useRef(null);

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const cleanup = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (unsubCallRef.current) {
      unsubCallRef.current();
      unsubCallRef.current = null;
    }
    if (unsubCandidatesRef.current) {
      unsubCandidatesRef.current();
      unsubCandidatesRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!currentUser || !paramCallId) return;

    async function setupCall() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true,
        });
        localStreamRef.current = stream;

        const pc = createPeerConnection();
        pcRef.current = pc;

        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          if (remoteAudioRef.current && event.streams[0]) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        await setupCallee(pc, paramCallId);
      } catch (err) {
        console.error('[Lifeframe] Voice call setup error:', err);
        setCallStatus('error');
      }
    }

    setupCall();
    return cleanup;
  }, [currentUser, paramCallId, cleanup]);

  async function setupCallee(pc, id) {
    unsubCallRef.current = listenForCallUpdates(id, async (callData) => {
      setRemoteName(callData.callerName || 'Caller');
      setRemoteAvatar(callData.callerAvatar || '');

      if (callData.status === 'ended' || callData.status === 'rejected') {
        setCallStatus('ended');
        cleanup();
        setTimeout(() => navigate('/messages'), 1500);
        return;
      }

      if (callData.offer && !callData.answer && pc.signalingState === 'stable') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await setCallAnswer(id, answer);
          setCallStatus('connected');
        } catch (err) {
          console.error('[Lifeframe] Error creating answer:', err);
        }
      }
    });

    unsubCandidatesRef.current = listenForICECandidates(id, 'caller', async (candidateData) => {
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidateData));
        }
      } catch (err) {
        console.error('[Lifeframe] Error adding ICE candidate:', err);
      }
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendICECandidate(id, event.candidate, 'callee');
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setCallStatus('ended');
        cleanup();
        setTimeout(() => navigate('/messages'), 1500);
      }
    };
  }

  async function handleEndCall() {
    if (paramCallId) {
      await endCall(paramCallId);
    }
    cleanup();
    navigate('/messages');
  }

  function toggleMute() {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }

  function toggleSpeaker() {
    setIsSpeaker(!isSpeaker);
    // Speaker toggle is handled by the device - this is a UI indicator
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <audio ref={remoteAudioRef} autoPlay />

      {/* Avatar with pulse animation */}
      <div style={{
        position: 'relative',
        marginBottom: '2rem',
      }}>
        {callStatus === 'connected' && (
          <div style={{
            position: 'absolute',
            inset: -10,
            borderRadius: '50%',
            border: '2px solid var(--primary)',
            animation: 'pulse 2s infinite',
          }} />
        )}
        <div className="avatar-md" style={{
          width: 100,
          height: 100,
          fontSize: '2.5rem',
        }}>
          {remoteAvatar ? (
            <img src={remoteAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {remoteName?.charAt(0) || '?'}
            </span>
          )}
        </div>
      </div>

      <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
        {remoteName || 'Connecting...'}
      </h3>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '3rem' }}>
        {callStatus === 'connected' ? formatDuration(callDuration) : callStatus === 'ended' ? 'Call ended' : 'Connecting...'}
      </p>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
      }}>
        <button
          onClick={toggleMute}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isMuted ? 'var(--danger)' : 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            {isMuted ? (
              <>
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
              </>
            ) : (
              <>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
              </>
            )}
          </svg>
        </button>

        <button
          onClick={toggleSpeaker}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isSpeaker ? 'var(--primary)' : 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            {isSpeaker ? (
              <>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </>
            ) : (
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            )}
          </svg>
        </button>

        <button
          onClick={handleEndCall}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </button>
      </div>
    </div>
  );
}
