import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  createPeerConnection,
  createCallDocument,
  listenForCallUpdates,
  sendICECandidate,
  listenForICECandidates,
  setCallOffer,
  setCallAnswer,
  endCall,
} from '../services/webrtc';

export default function VideoCall() {
  const { callId: paramCallId } = useParams();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();

  const [callId, setCallId] = useState(paramCallId || null);
  const [callStatus, setCallStatus] = useState('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteName, setRemoteName] = useState('');

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const timerRef = useRef(null);
  const unsubCallRef = useRef(null);
  const unsubCandidatesRef = useRef(null);

  // Start call timer when connected
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

  // Format seconds to mm:ss
  function formatDuration(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  // Cleanup function
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

  // Main call setup
  useEffect(() => {
    if (!currentUser) return;

    async function setupCall() {
      try {
        // Get local video/audio stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Create peer connection
        const pc = createPeerConnection();
        pcRef.current = pc;

        // Add local tracks to connection
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
          if (remoteVideoRef.current && event.streams[0]) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Determine if caller or callee
        if (paramCallId) {
          // We are joining an existing call (callee)
          await setupCallee(pc, paramCallId);
        } else {
          // This shouldn't happen in normal flow - calls are initiated from ChatView
          setCallStatus('error');
        }
      } catch (err) {
        console.error('[Lifeframe] Video call setup error:', err);
        setCallStatus('error');
      }
    }

    setupCall();
    return cleanup;
  }, [currentUser, paramCallId, cleanup]);

  async function setupCallee(pc, id) {
    setCallId(id);

    // Listen for call updates
    unsubCallRef.current = listenForCallUpdates(id, async (callData) => {
      setRemoteName(callData.callerName || 'Caller');

      if (callData.status === 'ended' || callData.status === 'rejected') {
        setCallStatus('ended');
        cleanup();
        setTimeout(() => navigate('/messages'), 1500);
        return;
      }

      // If we have offer and haven't answered yet
      if (callData.offer && !callData.answer && pc.signalingState !== 'stable') {
        // Already handled
      } else if (callData.offer && !callData.answer && pc.signalingState === 'stable') {
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

    // Handle ICE candidates from caller
    unsubCandidatesRef.current = listenForICECandidates(id, 'caller', async (candidateData) => {
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidateData));
        }
      } catch (err) {
        console.error('[Lifeframe] Error adding ICE candidate:', err);
      }
    });

    // Send our ICE candidates
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
    if (callId) {
      await endCall(callId);
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

  function toggleCamera() {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  }

  return (
    <div className="video-call-container" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      backgroundColor: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Remote video (full screen) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Local video (PiP) */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 120,
          height: 160,
          borderRadius: 12,
          objectFit: 'cover',
          border: '2px solid rgba(255,255,255,0.3)',
          zIndex: 10,
        }}
      />

      {/* Status overlay */}
      <div style={{
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 10,
      }}>
        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: 4 }}>
          {remoteName || 'Connecting...'}
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
          {callStatus === 'connected' ? formatDuration(callDuration) : callStatus === 'ended' ? 'Call ended' : 'Connecting...'}
        </p>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        zIndex: 10,
      }}>
        <button
          onClick={toggleMute}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isMuted ? 'var(--danger)' : 'rgba(255,255,255,0.2)',
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
          onClick={toggleCamera}
          style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isCameraOff ? 'var(--danger)' : 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            {isCameraOff ? (
              <>
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34m-7.72-2.06a4 4 0 1 1-5.56-5.56" />
              </>
            ) : (
              <>
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </>
            )}
          </svg>
        </button>

        <button
          onClick={handleEndCall}
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <line x1="23" y1="1" x2="1" y2="23" />
          </svg>
        </button>
      </div>

      {/* Connection status indicator */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: callStatus === 'connected' ? 'var(--success)' : callStatus === 'ended' ? 'var(--danger)' : '#f59e0b',
          animation: callStatus === 'connecting' ? 'pulse 1.5s infinite' : 'none',
        }} />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
          {callStatus === 'connected' ? 'Connected' : callStatus === 'ended' ? 'Ended' : 'Connecting'}
        </span>
      </div>
    </div>
  );
}
