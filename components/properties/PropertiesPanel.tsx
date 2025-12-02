import React from 'react';
import { Clip, ClipType } from '../../types';
import { Icons } from '../icons';

interface PropertiesPanelProps {
  clip: Clip | null;
  onUpdate: (properties: Partial<Clip['properties']>) => void;
}

const PropertyGroup = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="border-b border-slate-800 py-4">
    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-4">{title}</h3>
    <div className="px-4 space-y-4">
      {children}
    </div>
  </div>
);

const Slider = ({ label, value, min, max, unit = '', onChange }: any) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-xs text-slate-400">
      <span>{label}</span>
      <span>{value}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
    />
  </div>
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ clip, onUpdate }) => {
  if (!clip) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900 border-l border-slate-700">
        <Icons.Settings className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm">选择片段以查看属性</p>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto w-80 shrink-0">
      <div className="h-12 border-b border-slate-700 flex items-center px-4 bg-slate-900">
         <span className="font-semibold text-sm flex items-center gap-2">
           {clip.type === ClipType.VIDEO && <Icons.LayoutTemplate className="w-4 h-4 text-blue-400" />}
           {clip.type === ClipType.AUDIO && <Icons.Music className="w-4 h-4 text-emerald-400" />}
           {clip.name} 属性
         </span>
      </div>

      <PropertyGroup title="变换">
        <Slider 
          label="缩放" 
          value={clip.properties.scale} 
          min={0} max={200} unit="%" 
          onChange={(v: number) => onUpdate({ scale: v })} 
        />
        <Slider 
          label="旋转" 
          value={clip.properties.rotation} 
          min={0} max={360} unit="°" 
          onChange={(v: number) => onUpdate({ rotation: v })} 
        />
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800 p-2 rounded text-xs">
            <label className="text-slate-500 block mb-1">位置 X</label>
            <input 
              type="number" 
              value={clip.properties.positionX} 
              className="w-full bg-transparent outline-none"
              onChange={(e) => onUpdate({ positionX: Number(e.target.value) })}
            />
          </div>
          <div className="bg-slate-800 p-2 rounded text-xs">
            <label className="text-slate-500 block mb-1">位置 Y</label>
            <input 
              type="number" 
              value={clip.properties.positionY} 
              className="w-full bg-transparent outline-none"
              onChange={(e) => onUpdate({ positionY: Number(e.target.value) })}
            />
          </div>
        </div>
      </PropertyGroup>

      <PropertyGroup title="合成">
        <Slider 
          label="不透明度" 
          value={clip.properties.opacity} 
          min={0} max={100} unit="%" 
          onChange={(v: number) => onUpdate({ opacity: v })} 
        />
      </PropertyGroup>

      {clip.type !== ClipType.IMAGE && (
        <PropertyGroup title="音频">
          <Slider 
            label="音量" 
            value={clip.properties.volume} 
            min={0} max={100} unit="%" 
            onChange={(v: number) => onUpdate({ volume: v })} 
          />
        </PropertyGroup>
      )}

      {clip.type === ClipType.VIDEO && (
        <PropertyGroup title="变速">
           <Slider 
            label="速度" 
            value={clip.properties.speed} 
            min={0.1} max={5} 
            onChange={(v: number) => onUpdate({ speed: v })} 
          />
        </PropertyGroup>
      )}
    </div>
  );
};