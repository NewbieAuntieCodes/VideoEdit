import React, { useMemo } from 'react';
import { Clip, ClipType } from '../../types';

interface ClipItemProps {
  clip: Clip;
  zoom: number; // pixels per second
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ClipItem: React.FC<ClipItemProps> = ({ clip, zoom, isSelected, onSelect }) => {
  const width = clip.duration * zoom;
  const left = clip.start * zoom;

  const colorClass = useMemo(() => {
    switch (clip.type) {
      case ClipType.VIDEO: return 'bg-blue-600/80 border-blue-400';
      case ClipType.AUDIO: return 'bg-emerald-600/80 border-emerald-400';
      case ClipType.TEXT: return 'bg-purple-600/80 border-purple-400';
      case ClipType.IMAGE: return 'bg-orange-600/80 border-orange-400';
      default: return 'bg-slate-600 border-slate-400';
    }
  }, [clip.type]);

  return (
    <div
      className={`absolute h-full rounded-md border-l-4 cursor-pointer overflow-hidden transition-all group ${colorClass} ${isSelected ? 'ring-2 ring-white z-10' : 'hover:brightness-110 z-0'}`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        top: '4px',
        height: 'calc(100% - 8px)',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(clip.id);
      }}
    >
      <div className="px-2 py-1 text-xs text-white font-medium truncate flex items-center h-full select-none">
        {clip.name}
      </div>
      
      {/* Resize handles (visual only for this demo) */}
      {isSelected && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize bg-white/20 hover:bg-white/50" />
          <div className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize bg-white/20 hover:bg-white/50" />
        </>
      )}
    </div>
  );
};