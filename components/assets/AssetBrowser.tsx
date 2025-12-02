import React, { useState, useRef } from 'react';
import { ClipType, Asset } from '../../types';
import { Icons } from '../icons';
import { Button } from '../ui/Button';
import { generateVideoScript, generateAIImage } from '../../services/geminiService';

interface AssetBrowserProps {
  onAddClip: (type: ClipType, src?: string, name?: string, duration?: number) => void;
}

export const AssetBrowser: React.FC<AssetBrowserProps> = ({ onAddClip }) => {
  const [activeTab, setActiveTab] = useState<'media' | 'ai'>('media');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const [importedAssets, setImportedAssets] = useState<Asset[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to determine clip type from mime type
  const getClipTypeFromMime = (mime: string): ClipType => {
    if (mime.startsWith('video/')) return ClipType.VIDEO;
    if (mime.startsWith('audio/')) return ClipType.AUDIO;
    if (mime.startsWith('image/')) return ClipType.IMAGE;
    return ClipType.TEXT;
  };

  // Helper to format duration seconds to MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getMediaDuration = (file: File): Promise<number | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        resolve(5); // Default for images
        return;
      }
      
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => resolve(undefined);
      video.src = URL.createObjectURL(file);
    });
  };

  const processFiles = async (files: FileList | File[]) => {
    const newAssets: Asset[] = [];
    
    for (const file of Array.from(files)) {
      const type = getClipTypeFromMime(file.type);
      const url = URL.createObjectURL(file);
      const duration = await getMediaDuration(file);
      
      newAssets.push({
        id: Math.random().toString(36).substr(2, 9),
        type,
        url: url,
        name: file.name,
        thumbnail: type === ClipType.IMAGE ? url : undefined,
        duration: duration
      });
    }
    
    setImportedAssets(prev => [...prev, ...newAssets]);
    setActiveTab('media');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragStart = (e: React.DragEvent, asset: Asset) => {
    e.dataTransfer.setData('application/novacut-asset', JSON.stringify(asset));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setAiResult(null);
    setAiImage(null);

    if (prompt.toLowerCase().includes("image") || prompt.toLowerCase().includes("图片") || prompt.toLowerCase().includes("画")) {
        const result = await generateAIImage(prompt);
        if (result) {
            setAiImage(result.url);
        }
    } else {
        const text = await generateVideoScript(prompt);
        setAiResult(text);
    }
    setIsGenerating(false);
  };

  // Only show imported assets, removed hardcoded demo assets
  const assets: Asset[] = importedAssets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className={`w-80 bg-slate-900 border-r border-slate-700 flex flex-col shrink-0 transition-colors h-full`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        accept="video/*,image/*,audio/*"
        onChange={handleFileSelect}
      />

      {/* Tabs */}
      <div className="flex border-b border-slate-700 shrink-0">
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'media' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setActiveTab('media')}
        >
          媒体素材
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium ${activeTab === 'ai' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white'}`}
          onClick={() => setActiveTab('ai')}
        >
          <span className="flex items-center justify-center gap-2">
             <Icons.Wand2 className="w-3 h-3" />
             AI 助手
          </span>
        </button>
      </div>

      {activeTab === 'media' ? (
        <div className="flex flex-col h-full overflow-hidden">
           {/* Top Toolbar (Import, Search) */}
           <div className="p-3 space-y-3 shrink-0">
              <div className="flex items-center gap-2">
                 <Button onClick={handleImportClick} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white rounded px-3 py-1 flex items-center gap-1 h-8">
                    <Icons.Plus className="w-4 h-4" />
                    导入
                 </Button>
                 <div className="relative flex-1">
                    <Icons.Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="搜索文件..." 
                      className="w-full bg-slate-800 border border-slate-700 rounded pl-7 pr-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-500 h-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>
              
              <div className="flex items-center justify-between text-slate-400">
                 <span className="text-xs font-medium pl-1">全部</span>
                 <div className="flex items-center gap-2">
                    <Icons.LayoutGrid className="w-4 h-4 cursor-pointer hover:text-white" />
                    <Icons.ListFilter className="w-4 h-4 cursor-pointer hover:text-white" />
                 </div>
              </div>
           </div>

           {/* Asset Grid */}
           <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
             {/* Drop Overlay */}
             {isDraggingOver && (
               <div className="absolute inset-0 z-50 bg-cyan-900/20 border-2 border-dashed border-cyan-500 flex items-center justify-center pointer-events-none m-2 rounded-lg">
                 <div className="text-cyan-400 font-bold flex flex-col items-center">
                   <Icons.Upload className="w-8 h-8 mb-2" />
                   <span>释放以导入</span>
                 </div>
               </div>
             )}

             <div className="grid grid-cols-2 gap-2 pb-4">
                {assets.map(asset => (
                  <div 
                    key={asset.id} 
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, asset)}
                    className="group relative bg-slate-800 rounded-md overflow-hidden cursor-grab active:cursor-grabbing hover:ring-1 hover:ring-cyan-500 flex flex-col"
                    onClick={() => onAddClip(asset.type, asset.url || asset.thumbnail, asset.name, asset.duration)}
                  >
                    {/* Thumbnail Area */}
                    <div className="aspect-video bg-slate-900 relative">
                       {asset.type === ClipType.IMAGE || asset.type === ClipType.VIDEO ? (
                         <img src={asset.thumbnail || asset.url} className="w-full h-full object-cover" alt={asset.name} />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-800">
                             <Icons.Music className="text-slate-600 w-8 h-8" />
                          </div>
                       )}
                       
                       {/* Overlays */}
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                          <Icons.Plus className="text-white w-6 h-6" />
                       </div>
                       
                       {asset.type === ClipType.VIDEO && asset.duration && (
                         <span className="absolute bottom-1 right-1 bg-black/70 px-1 rounded text-[9px] text-white font-mono">
                           {formatDuration(asset.duration)}
                         </span>
                       )}
                        {asset.type === ClipType.AUDIO && asset.duration && (
                         <span className="absolute bottom-1 right-1 bg-black/70 px-1 rounded text-[9px] text-white font-mono">
                           {formatDuration(asset.duration)}
                         </span>
                       )}
                    </div>
                    
                    {/* Info Area */}
                    <div className="p-2">
                       <div className="text-[10px] text-slate-300 truncate" title={asset.name}>{asset.name}</div>
                    </div>
                  </div>
                ))}
             </div>
             
             {assets.length === 0 && (
                <div className="text-center py-8 text-slate-600 text-xs">
                   无素材，点击上方导入或拖入文件
                </div>
             )}
             
             {/* Preset Buttons for Quick Access */}
             <div className="mt-4 border-t border-slate-800 pt-4">
               <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">常用组件</h3>
               <div className="space-y-1">
                 <Button variant="ghost" className="w-full justify-start text-xs h-8 px-2" onClick={() => onAddClip(ClipType.TEXT, undefined, "默认文本")}>
                   <Icons.Type className="w-3 h-3 mr-2" /> 默认文本
                 </Button>
               </div>
             </div>
           </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
               <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">AI 创意助手</label>
               <textarea 
                 className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white mb-2 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                 rows={4}
                 placeholder="输入提示词..."
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
               />
               <Button 
                className="w-full" 
                size="sm"
                disabled={isGenerating || !prompt}
                onClick={handleGenerate}
               >
                 {isGenerating ? <Icons.RotateCcw className="animate-spin w-3 h-3 mr-2"/> : <Icons.Wand2 className="w-3 h-3 mr-2" />}
                 {isGenerating ? '思考中...' : '生成'}
               </Button>
             </div>

             {aiResult && (
               <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400">生成的脚本</span>
                    <Button variant="ghost" size="sm" onClick={() => onAddClip(ClipType.TEXT, undefined, aiResult.substring(0, 20) + "...")}>使用</Button>
                 </div>
                 <pre className="text-[10px] text-slate-300 whitespace-pre-wrap font-sans max-h-40 overflow-y-auto custom-scrollbar p-1 bg-slate-900 rounded">
                   {aiResult}
                 </pre>
               </div>
             )}

             {aiImage && (
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                   <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400">生成的图片</span>
                   </div>
                   <img src={aiImage} alt="AI Generated" className="rounded-md w-full mb-2" />
                   <Button size="sm" className="w-full" onClick={() => onAddClip(ClipType.IMAGE, aiImage, "AI 生成图片")}>添加到轨道</Button>
                </div>
             )}
        </div>
      )}
    </div>
  );
};