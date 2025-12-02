import React, { useState, useEffect, useCallback } from 'react';
import { ProjectState, Track, Clip, ClipType } from './types';
import { Header } from './components/Header';
import { AssetBrowser } from './components/assets/AssetBrowser';
import { Player } from './components/player/Player';
import { PropertiesPanel } from './components/properties/PropertiesPanel';
import { Timeline } from './components/timeline/Timeline';

// Helper to create IDs
const uid = () => Math.random().toString(36).substr(2, 9);

const INITIAL_STATE: ProjectState = {
  tracks: [
    { id: '1', type: 'visual', isMuted: false, isLocked: false, clips: [] },
    { id: '2', type: 'audio', isMuted: false, isLocked: false, clips: [] },
  ],
  currentTime: 0,
  duration: 60,
  selectedClipId: null,
  isPlaying: false,
};

export default function App() {
  const [project, setProject] = useState<ProjectState>(INITIAL_STATE);
  const [zoom, setZoom] = useState(20); // pixels per second

  // Playback Loop
  useEffect(() => {
    let interval: number;
    if (project.isPlaying) {
      interval = window.setInterval(() => {
        setProject(prev => {
          if (prev.currentTime >= prev.duration) {
            return { ...prev, isPlaying: false, currentTime: 0 };
          }
          return { ...prev, currentTime: prev.currentTime + 0.1 };
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [project.isPlaying]);

  const handleSelectClip = (id: string | null) => {
    setProject(prev => ({ ...prev, selectedClipId: id }));
  };

  const handleSeek = (time: number) => {
    setProject(prev => ({ ...prev, currentTime: time }));
  };

  const handleTogglePlay = () => {
    setProject(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleAddTrack = () => {
    setProject(prev => ({
      ...prev,
      tracks: [...prev.tracks, { 
        id: uid(), 
        type: 'visual', 
        isMuted: false, 
        isLocked: false, 
        clips: [] 
      }]
    }));
  };

  const handleAddClip = (type: ClipType, src?: string, name?: string) => {
    const newClip: Clip = {
      id: uid(),
      trackId: '1', // Default to first track for demo
      type,
      name: name || '新片段',
      start: project.currentTime,
      duration: type === ClipType.IMAGE || type === ClipType.TEXT ? 5 : 10,
      src,
      content: type === ClipType.TEXT ? (name || "文本") : undefined,
      properties: {
        opacity: 100,
        scale: 100,
        positionX: 0,
        positionY: 0,
        rotation: 0,
        volume: 100,
        speed: 1,
      }
    };

    setProject(prev => {
        // Find suitable track
        const targetTrackIndex = prev.tracks.findIndex(t => 
            (type === ClipType.AUDIO && t.type === 'audio') || 
            (type !== ClipType.AUDIO && t.type === 'visual')
        );
        
        if (targetTrackIndex === -1) return prev; // Should handle creating track

        const newTracks = [...prev.tracks];
        newTracks[targetTrackIndex] = {
            ...newTracks[targetTrackIndex],
            clips: [...newTracks[targetTrackIndex].clips, newClip]
        };

        return { ...prev, tracks: newTracks, selectedClipId: newClip.id };
    });
  };

  const handleUpdateClip = (props: Partial<Clip['properties']>) => {
    if (!project.selectedClipId) return;

    setProject(prev => {
      const newTracks = prev.tracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => {
          if (clip.id === prev.selectedClipId) {
            return { ...clip, properties: { ...clip.properties, ...props } };
          }
          return clip;
        })
      }));
      return { ...prev, tracks: newTracks };
    });
  };

  const selectedClip = React.useMemo(() => {
    for (const track of project.tracks) {
      const clip = track.clips.find(c => c.id === project.selectedClipId);
      if (clip) return clip;
    }
    return null;
  }, [project.tracks, project.selectedClipId]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Header 
        projectName="未命名项目" 
        onExport={() => alert("导出功能将使用 ffmpeg.wasm 渲染时间轴")} 
      />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Assets */}
        <AssetBrowser onAddClip={handleAddClip} />

        {/* Middle: Player */}
        <div className="flex-1 flex flex-col min-w-0">
          <Player 
             tracks={project.tracks} 
             currentTime={project.currentTime} 
             isPlaying={project.isPlaying}
             onTogglePlay={handleTogglePlay}
          />
          
          {/* Bottom: Timeline (inside middle column flex flow, typically timeline is wide) */}
          <div className="h-1/2 border-t border-slate-700">
             <Timeline 
               tracks={project.tracks}
               currentTime={project.currentTime}
               duration={project.duration}
               zoom={zoom}
               selectedClipId={project.selectedClipId}
               onSelectClip={handleSelectClip}
               onSeek={handleSeek}
               onZoomIn={() => setZoom(z => Math.min(z * 1.2, 100))}
               onZoomOut={() => setZoom(z => Math.max(z / 1.2, 5))}
               onAddTrack={handleAddTrack}
             />
          </div>
        </div>

        {/* Right: Properties */}
        <PropertiesPanel clip={selectedClip} onUpdate={handleUpdateClip} />
      </div>
    </div>
  );
}