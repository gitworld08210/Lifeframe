import { create } from 'zustand';

interface CallState {
  isInCall: boolean;
  callType: 'voice' | 'video' | null;
  remoteUser: { uid: string; displayName: string; avatarUrl: string } | null;
  isMuted: boolean;
  isCameraOff: boolean;
  startCall: (params: {
    callType: 'voice' | 'video';
    remoteUser: { uid: string; displayName: string; avatarUrl: string };
  }) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  isInCall: false,
  callType: null,
  remoteUser: null,
  isMuted: false,
  isCameraOff: false,
  startCall: ({ callType, remoteUser }) =>
    set({ isInCall: true, callType, remoteUser, isMuted: false, isCameraOff: false }),
  endCall: () =>
    set({ isInCall: false, callType: null, remoteUser: null, isMuted: false, isCameraOff: false }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  toggleCamera: () => set((state) => ({ isCameraOff: !state.isCameraOff })),
}));
