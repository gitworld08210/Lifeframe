import { collection, doc, addDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// STUN server configuration for NAT traversal
export const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

/**
 * Creates a new RTCPeerConnection with the configured STUN servers
 */
export function createPeerConnection() {
  return new RTCPeerConnection(rtcConfig);
}

/**
 * Creates a call document in Firestore for signaling
 * @param {Object} callerInfo - { uid, displayName, avatarUrl }
 * @param {string} recipientId - The UID of the user being called
 * @param {string} type - 'video' or 'voice'
 * @returns {Promise<string>} The call document ID
 */
export async function createCallDocument(callerInfo, recipientId, type) {
  const callRef = await addDoc(collection(db, 'calls'), {
    callerId: callerInfo.uid,
    callerName: callerInfo.displayName || 'Unknown',
    callerAvatar: callerInfo.avatarUrl || '',
    recipientId,
    type,
    status: 'ringing',
    offer: null,
    answer: null,
    createdAt: serverTimestamp(),
  });
  return callRef.id;
}

/**
 * Listens for updates to a call document
 * @param {string} callId - The call document ID
 * @param {Function} callback - Called with updated call data
 * @returns {Function} Unsubscribe function
 */
export function listenForCallUpdates(callId, callback) {
  return onSnapshot(doc(db, 'calls', callId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
}

/**
 * Sends an ICE candidate to the appropriate subcollection
 * @param {string} callId - The call document ID
 * @param {RTCIceCandidate} candidate - The ICE candidate
 * @param {string} role - 'caller' or 'callee'
 */
export async function sendICECandidate(callId, candidate, role) {
  const subcollection = role === 'caller' ? 'callerCandidates' : 'calleeCandidates';
  await addDoc(collection(db, 'calls', callId, subcollection), candidate.toJSON());
}

/**
 * Listens for ICE candidates from the remote peer
 * @param {string} callId - The call document ID
 * @param {string} role - 'caller' or 'callee' - the REMOTE role to listen to
 * @param {Function} callback - Called with each new candidate
 * @returns {Function} Unsubscribe function
 */
export function listenForICECandidates(callId, role, callback) {
  const subcollection = role === 'caller' ? 'callerCandidates' : 'calleeCandidates';
  return onSnapshot(collection(db, 'calls', callId, subcollection), (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'added') {
        callback(change.doc.data());
      }
    });
  });
}

/**
 * Updates the call document with an offer
 * @param {string} callId - The call document ID
 * @param {RTCSessionDescription} offer - The SDP offer
 */
export async function setCallOffer(callId, offer) {
  await updateDoc(doc(db, 'calls', callId), {
    offer: { type: offer.type, sdp: offer.sdp },
  });
}

/**
 * Updates the call document with an answer
 * @param {string} callId - The call document ID
 * @param {RTCSessionDescription} answer - The SDP answer
 */
export async function setCallAnswer(callId, answer) {
  await updateDoc(doc(db, 'calls', callId), {
    answer: { type: answer.type, sdp: answer.sdp },
    status: 'connected',
  });
}

/**
 * Ends a call by updating its status
 * @param {string} callId - The call document ID
 */
export async function endCall(callId) {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'ended',
      endedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[Lifeframe] Error ending call:', err);
  }
}

/**
 * Rejects an incoming call
 * @param {string} callId - The call document ID
 */
export async function rejectCall(callId) {
  try {
    await updateDoc(doc(db, 'calls', callId), {
      status: 'rejected',
      endedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('[Lifeframe] Error rejecting call:', err);
  }
}
