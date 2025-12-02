import React, { useRef } from 'react';
import { Track, Clip } from '../../types';
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
  onAddTrack
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
                <div key={track.id} className="h-24 border-b border-slate-800/50 relative bg-slate-900/20 hover:bg-slate-900/40 transition-colors">
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