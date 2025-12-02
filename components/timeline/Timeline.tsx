import React, { useRef } from 'react';
import { Track, Clip, ClipType, Asset } from '../../types';
import { ClipItem } from './ClipItem';
import { TimeRuler } from './TimeRuler';
import { Icons } from '../icons';
import { Button } from '../ui/Button';

interface TimelineProps {
  tracks: Track[];
  currentTime: number;
  duration: number;
  zoom: number;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
  onSeek: (time: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddTrack: () => void;
  onDropAsset: (trackId: string, time: number, asset: Asset) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  currentTime,
  duration,
  zoom,
  selectedClipId,
  onSelectClip,
  onSeek,
  onZoomIn,
  onZoomOut,
  onAddTrack,
  onDropAsset
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to get time from mouse x
  const getTimeFromEvent = (e: React.DragEvent) => {
    if (!scrollContainerRef.current) return 0;
    const rect = scrollContainerRef.current.getBoundingClientRect();
    const scrollLeft = scrollContainerRef.current.scrollLeft;
    const x = e.clientX - rect.left + scrollLeft;
    return Math.max(0, x / zoom);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const time = getTimeFromEvent(e);
    
    // 1. Try handling Internal Asset Drag
    const assetJson = e.dataTransfer.getData('application/novacut-asset');
    if (assetJson) {
      try {
        const asset = JSON.parse(assetJson) as Asset;
        onDropAsset(trackId, time, asset);
        return;
      } catch (err) {
        console.error("Failed to parse dropped asset", err);
      }
    }

    // 2. Try handling External File Drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
       Array.from(e.dataTransfer.files).forEach(file => {
          let type = ClipType.TEXT;
          if (file.type.startsWith('video/')) type = ClipType.VIDEO;
          if (file.type.startsWith('audio/')) type = ClipType.AUDIO;
          if (file.type.startsWith('image/')) type = ClipType.IMAGE;

          const url = URL.createObjectURL(file);
          const asset: Asset = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            name: file.name,
            url: url,
            thumbnail: type === ClipType.IMAGE ? url : undefined
          };
          onDropAsset(trackId, time, asset);
       });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 select-none">
      {/* Timeline Controls */}
      <div className="h-10 border-b border-slate-700 bg-slate-900 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={onAddTrack} title="添加轨道">
             <Icons.Plus className="w-4 h-4" />
           </Button>
           <div className="h-4 w-px bg-slate-700 mx-1" />
           <span className="text-xs text-slate-400">
             {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
           </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onZoomOut} title="缩小">
            <Icons.ZoomOut className="w-4 h-4" />
          </Button>
          <div className="w-20 bg-slate-700 h-1 rounded-full relative">
            <div className="absolute left-0 top-0 bottom-0 bg-slate-500 rounded-full" style={{ width: '50%' }} />
          </div>
          <Button variant="ghost" size="icon" onClick={onZoomIn} title="放大">
            <Icons.ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Track Headers (Left Column) */}
        <div className="w-48 bg-slate-900 border-r border-slate-700 shrink-0 z-20 flex flex-col pt-8">
          {tracks.map((track) => (
            <div key={track.id} className="h-24 border-b border-slate-800 p-2 flex flex-col justify-center relative group">
              <div className="flex items-center gap-2 text-slate-300 text-sm mb-1">
                {track.type === 'visual' ? <Icons.Layers className="w-3 h-3 text-blue-400" /> : <Icons.Music className="w-3 h-3 text-emerald-400" />}
                <span className="uppercase text-[10px] tracking-wider font-bold text-slate-500">轨道 {track.id}</span>
              </div>
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Icons.Volume2 className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Icons.Square className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable Tracks Area */}
        <div className="flex-1 overflow-auto relative bg-slate-950" ref={scrollContainerRef}>
           {/* Ruler */}
           <div className="sticky top-0 z-10">
              <TimeRuler 
                duration={duration} 
                zoom={zoom} 
                currentTime={currentTime} 
                onSeek={onSeek} 
              />
           </div>

           {/* Tracks Container */}
           <div 
             className="relative min-w-full"
             style={{ width: `${Math.max(duration * zoom, 1000)}px` }}
             onClick={() => onSelectClip(null)}
           >
              {/* Playhead Line */}
              <div 
                className="absolute top-0 bottom-0 w-px bg-cyan-500 z-30 pointer-events-none transition-all duration-75"
                style={{ left: `${currentTime * zoom}px` }}
              />

              {tracks.map((track) => (
                <div 
                  key={track.id} 
                  className="h-24 border-b border-slate-800/50 relative bg-slate-900/20 transition-colors hover:bg-slate-900/40"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, track.id)}
                >
                  {track.clips.map((clip) => (
                    <ClipItem 
                      key={clip.id} 
                      clip={clip} 
                      zoom={zoom} 
                      isSelected={selectedClipId === clip.id}
                      onSelect={onSelectClip}
                    />
                  ))}
                </div>
              ))}
              
              {/* Empty space at bottom */}
              <div className="h-32" />
           </div>
        </div>
      </div>
    </div>
  );
};