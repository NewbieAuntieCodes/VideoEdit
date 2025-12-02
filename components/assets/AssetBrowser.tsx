import React, { useState } from 'react';
import { ClipType, Asset } from '../../types';
import { Icons } from '../icons';
import { Button } from '../ui/Button';
import { generateVideoScript, generateAIImage } from '../../services/geminiService';

interface AssetBrowserProps {
  onAddClip: (type: ClipType, src?: string, name?: string) => void;
}

export const AssetBrowser: React.FC<AssetBrowserProps> = ({ onAddClip }) => {
  const [activeTab, setActiveTab] = useState<'media' | 'ai'>('media');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiImage, setAiImage] = useState<string | null>(null);

  const assets: Asset[] = [
    { id: '1', type: ClipType.VIDEO, url: '', name: '演示视频 1', thumbnail: 'https://picsum.photos/100/100?random=1' },
    { id: '2', type: ClipType.VIDEO, url: '', name: '演示视频 2', thumbnail: 'https://picsum.photos/100/100?random=2' },
    { id: '3', type: ClipType.IMAGE, url: '', name: '风景图片', thumbnail: 'https://picsum.photos/100/100?random=3' },
    { id: '4', type: ClipType.AUDIO, url: '', name: '欢快音乐', thumbnail: '' },
  ];

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setAiResult(null);
    setAiImage(null);

    // Heuristic to decide if user wants script or image
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

  return (
    <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col shrink-0">
      <div className="flex border-b border-slate-700">
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

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'media' ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">本地素材</h3>
              <div className="grid grid-cols-2 gap-2">
                 {assets.map(asset => (
                   <div 
                    key={asset.id} 
                    className="aspect-square bg-slate-800 rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-cyan-500 relative group"
                    onClick={() => onAddClip(asset.type, asset.thumbnail, asset.name)}
                   >
                     {asset.type !== ClipType.AUDIO ? (
                       <img src={asset.thumbnail} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center">
                           <Icons.Music className="text-slate-600 w-8 h-8" />
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Icons.Plus className="text-white w-6 h-6" />
                     </div>
                     <span className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] truncate">{asset.name}</span>
                   </div>
                 ))}
                 <div className="aspect-square bg-slate-800/50 rounded-md border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:border-slate-500 hover:text-slate-300 transition-colors">
                    <Icons.Plus className="w-6 h-6 mb-1" />
                    <span className="text-xs">导入</span>
                 </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">预设文本</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start text-xs" onClick={() => onAddClip(ClipType.TEXT, undefined, "默认文本")}>
                  <Icons.Type className="w-4 h-4 mr-2" />
                  默认文本
                </Button>
                <Button variant="secondary" className="w-full justify-start text-xs" onClick={() => onAddClip(ClipType.TEXT, undefined, "粗体标题")}>
                  <Icons.Type className="w-4 h-4 mr-2" />
                  粗体标题
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
               <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">咨询 Gemini</label>
               <textarea 
                 className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white mb-2 focus:ring-1 focus:ring-cyan-500 outline-none resize-none"
                 rows={4}
                 placeholder="例如：'写一个关于咖啡的脚本' 或 '生成一张赛博朋克风格的城市图片'"
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
               />
               <Button 
                className="w-full" 
                disabled={isGenerating || !prompt}
                onClick={handleGenerate}
               >
                 {isGenerating ? <Icons.RotateCcw className="animate-spin w-4 h-4 mr-2"/> : <Icons.Wand2 className="w-4 h-4 mr-2" />}
                 {isGenerating ? '思考中...' : '生成'}
               </Button>
             </div>

             {aiResult && (
               <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400">生成的脚本</span>
                    <Button variant="ghost" size="sm" onClick={() => onAddClip(ClipType.TEXT, undefined, aiResult.substring(0, 20) + "...")}>添加文本</Button>
                 </div>
                 <pre className="text-xs text-slate-300 whitespace-pre-wrap font-sans max-h-60 overflow-y-auto custom-scrollbar">
                   {aiResult}
                 </pre>
               </div>
             )}

             {aiImage && (
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400">生成的素材</span>
                   </div>
                   <img src={aiImage} alt="AI Generated" className="rounded-md w-full mb-2" />
                   <Button size="sm" className="w-full" onClick={() => onAddClip(ClipType.IMAGE, aiImage, "AI 生成图片")}>添加到时间轴</Button>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};