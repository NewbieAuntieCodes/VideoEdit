export enum ClipType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
}

export interface Clip {
  id: string;
  trackId: string;
  type: ClipType;
  name: string;
  start: number; // Start time in seconds on timeline
  duration: number; // Duration in seconds
  src?: string; // URL for media
  content?: string; // Text content
  properties: ClipProperties;
}

export interface ClipProperties {
  opacity: number;
  scale: number;
  positionX: number;
  positionY: number;
  rotation: number;
  volume: number; // 0-100
  speed: number;
}

export interface Track {
  id: string;
  type: 'visual' | 'audio';
  isMuted: boolean;
  isLocked: boolean;
  clips: Clip[];
}

export interface ProjectState {
  tracks: Track[];
  currentTime: number; // in seconds
  duration: number; // total project duration
  selectedClipId: string | null;
  isPlaying: boolean;
}

export interface Asset {
  id: string;
  type: ClipType;
  url: string;
  name: string;
  thumbnail?: string;
  duration?: number; // Duration in seconds if available
}