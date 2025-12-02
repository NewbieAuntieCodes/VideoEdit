import { ProjectState, Track, Clip, ClipType, ClipProperties } from '../types';

// Helper types for CapCut JSON structure (Simplified)
interface CapCutDraft {
  materials: {
    videos: Array<{ id: string; path: string; duration: number; type: string }>;
    audios: Array<{ id: string; path: string; duration: number }>;
    texts: Array<{ id: string; content: string }>;
  };
  tracks: Array<{
    id: string;
    type: string;
    segments: Array<{
      id: string;
      material_id: string;
      source_timerange: { start: number; duration: number };
      target_timerange: { start: number; duration: number };
    }>;
  }>;
}

const uid = () => Math.random().toString(36).substr(2, 9);

// CapCut uses microseconds. Convert to seconds.
const US_TO_SEC = 1000000;

export const parseCapCutDraft = async (file: File): Promise<ProjectState | null> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as CapCutDraft;

    // 1. Parse Materials into a lookup map
    const materialMap = new Map<string, { type: ClipType; name: string; src?: string; duration?: number; content?: string }>();

    data.materials.videos?.forEach(m => {
      // Note: We cannot access local file paths (m.path) in browser directly due to security.
      // We use a placeholder or the file name.
      const name = m.path ? m.path.split('/').pop()?.split('\\').pop() || "Unknown Video" : "Video Asset";
      materialMap.set(m.id, { 
        type: ClipType.VIDEO, 
        name, 
        duration: m.duration / US_TO_SEC 
      });
    });

    data.materials.audios?.forEach(m => {
        const name = m.path ? m.path.split('/').pop()?.split('\\').pop() || "Unknown Audio" : "Audio Asset";
        materialMap.set(m.id, { 
          type: ClipType.AUDIO, 
          name,
          duration: m.duration / US_TO_SEC
        });
    });

    data.materials.texts?.forEach(m => {
        // CapCut text structure is complex (JSON string inside JSON), simplified here
        let content = "Text";
        try {
            // Sometimes content is raw string, sometimes XML/JSON string
            content = m.content || "Text Layer"; 
        } catch (e) {}
        
        materialMap.set(m.id, {
            type: ClipType.TEXT,
            name: "Text Layer",
            content: content
        });
    });

    // 2. Parse Tracks
    const tracks: Track[] = [];
    let maxDuration = 0;

    data.tracks.forEach((ccTrack) => {
      // Filter out empty tracks or specialized tracks we don't support yet
      if (!ccTrack.segments || ccTrack.segments.length === 0) return;

      const trackId = uid();
      // Determine track type based on first segment material
      const firstSegmentMat = materialMap.get(ccTrack.segments[0].material_id);
      const trackType = (firstSegmentMat?.type === ClipType.AUDIO) ? 'audio' : 'visual';

      const clips: Clip[] = [];

      ccTrack.segments.forEach(seg => {
        const material = materialMap.get(seg.material_id);
        if (!material) return;

        const start = seg.target_timerange.start / US_TO_SEC;
        const duration = seg.target_timerange.duration / US_TO_SEC;
        
        // Update total project duration
        if (start + duration > maxDuration) maxDuration = start + duration;

        clips.push({
          id: uid(),
          trackId: trackId,
          type: material.type,
          name: material.name,
          start: start,
          duration: duration,
          src: "", // We don't have the file blob yet
          content: material.content || material.name,
          properties: {
            opacity: 100,
            scale: 100,
            positionX: 0,
            positionY: 0,
            rotation: 0,
            volume: 100,
            speed: 1
          }
        });
      });

      tracks.push({
        id: trackId,
        type: trackType,
        isMuted: false,
        isLocked: false,
        clips: clips
      });
    });

    if (tracks.length === 0) return null;

    return {
      tracks,
      currentTime: 0,
      duration: Math.max(maxDuration + 5, 60), // Add padding
      selectedClipId: null,
      isPlaying: false
    };

  } catch (error) {
    console.error("Failed to parse CapCut draft:", error);
    alert("解析剪映草稿失败。请确保上传的是 draft_content.json 文件。");
    return null;
  }
};