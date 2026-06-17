export type CallStatus =
  | 'ringing'
  | 'active'
  | 'ended'
  | 'declined'
  | 'missed'
  | 'failed';

export interface Call {
  id: string;
  callerId: string;
  callerUsername: string;
  callerDisplayName: string;
  callerAvatarUrl: string;
  calleeId: string;
  calleeUsername: string;
  calleeDisplayName: string;
  calleeAvatarUrl: string;
  type: 'voice' | 'video';
  status: CallStatus;
  roomId: string;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null; // seconds
  createdAt: string;
}
