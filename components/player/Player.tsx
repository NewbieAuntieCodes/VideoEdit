import React, { useMemo } from 'react';
import { Track, Clip, ClipType } from '../../types';
import { Icons } from '../icons';
import { Button } from '../ui/Button';

interface PlayerProps {
  tracks: Track[];
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const Player: React.FC<PlayerProps> = ({ tracks, currentTime, isPlaying, onTogglePlay }) => {
  
  // Logic to determine what to show at currentTime
  // This is a simplified software renderer.
  // In a real app, this would be a WebGL canvas or synchronized <video> elements.
  const activeClips = useMemo(() => {
    return tracks
      .filter(t => !t.isMuted && t.type === 'visual')
      .flatMap(t => t.clips)
      .filter(c => currentTime >= c.start && currentTime < c.start + c.duration)
      .sort((a, b) => {
        // Simple z-index based on track order (mocked here)
        return 0; 
      });
  }, [tracks, currentTime]);

  const primaryClip = activeClips[activeClips.length - 1]; // Topmost clip

  return (
    <div className="flex-1 flex flex-col bg-slate-950 relative">
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        {/* The Canvas / Screen */}
        <div className="aspect-video bg-black shadow-2xl relative w-full max-h-full max-w-4xl border border-slate-800 flex items-center justify-center overflow-hidden">
          {primaryClip ? (
            primaryClip.type === ClipType.TEXT ? (
              <div 
                className="text-white text-4xl font-bold p-4 text-center"
                style={{
                    opacity: primaryClip.properties.opacity / 100,
                    transform: `scale(${primaryClip.properties.scale / 100}) rotate(${primaryClip.properties.rotation}deg)`,
                }}
              >
                {primaryClip.content || primaryClip.name}
              </div>
            ) : primaryClip.type === ClipType.IMAGE || primaryClip.type === ClipType.VIDEO ? (
              <img 
                src={primaryClip.src || "https://picsum.photos/1280/720"} 
                alt="Preview"
                className="w-full h-full object-cover"
                style={{
                    opacity: primaryClip.properties.opacity / 100,
                    transform: `scale(${primaryClip.properties.scale / 100}) rotate(${primaryClip.properties.rotation}deg)`,
                }} 
              />
            ) : (
               <div className="text-slate-500 flex flex-col items-center">
                  <Icons.Music className="w-12 h-12 mb-2" />
                  <span>音频播放中</span>
               </div>
            )
          ) : (
            <div className="text-slate-700 flex flex-col items-center">
              <p>无画面</p>
            </div>
          )}
          
          {/* Overlay info */}
          <div className="absolute bottom-4 right-4 bg-black/50 px-2 py-1 rounded text-xs font-mono text-white">
            {Math.floor(currentTime / 60).toString().padStart(2, '0')}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="h-14 shrink-0 flex items-center justify-center gap-4 border-t border-slate-800 bg-slate-900">
         <Button variant="ghost" size="icon" onClick={() => {}}>
            <Icons.ChevronLeft className="w-5 h-5" />
         </Button>
         <Button 
            variant="primary" 
            size="icon" 
            className="w-10 h-10 rounded-full"
            onClick={onTogglePlay}
         >
            {isPlaying ? <Icons.Pause className="w-5 h-5 fill-current" /> : <Icons.Play className="w-5 h-5 fill-current pl-0.5" />}
         </Button>
         <Button variant="ghost" size="icon" onClick={() => {}}>
            <Icons.ChevronRight className="w-5 h-5" />
         </Button>
      </div>
    </div>
  );
};