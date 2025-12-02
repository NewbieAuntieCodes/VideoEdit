import React, { useRef, useEffect } from 'react';

interface TimeRulerProps {
  duration: number;
  zoom: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export const TimeRuler: React.FC<TimeRulerProps> = ({ duration, zoom, currentTime, onSeek }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const time = Math.max(0, x / zoom);
    onSeek(time);
  };

  // Generate ticks
  const ticks = [];
  const totalWidth = Math.max(duration * zoom, window.innerWidth);
  const step = 5; // seconds per major tick

  for (let i = 0; i <= Math.ceil(duration / step) * step + 30; i += 1) {
     const isMajor = i % 5 === 0;
     if (!isMajor && zoom < 10) continue; // Skip minor ticks if zoomed out

     ticks.push(
       <div 
         key={i} 
         className={`absolute bottom-0 border-l border-slate-500 ${isMajor ? 'h-3' : 'h-1.5'}`}
         style={{ left: `${i * zoom}px` }}
       >
         {isMajor && (
           <span className="absolute top-[-14px] left-1 text-[10px] text-slate-400 select-none">
             {formatTime(i)}
           </span>
         )}
       </div>
     );
  }

  return (
    <div 
      ref={containerRef}
      className="h-8 bg-slate-900 border-b border-slate-700 relative cursor-pointer"
      style={{ width: `${totalWidth}px` }}
      onMouseDown={handleMouseDown}
    >
      {ticks}
      {/* Playhead Indicator in Ruler */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-cyan-500 z-20 pointer-events-none"
        style={{ left: `${currentTime * zoom}px` }}
      >
        <div className="absolute -top-0 -left-[5px] w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[8px] border-t-cyan-500" />
      </div>
    </div>
  );
};