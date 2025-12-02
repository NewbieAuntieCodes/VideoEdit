
import React, { useRef } from 'react';
import { Icons } from './icons';
import { Button } from './ui/Button';

interface HeaderProps {
  projectName: string;
  onExport: () => void;
  onImportCapCut: (file: File) => void;
  onRelinkAssets?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ projectName, onExport, onImportCapCut, onRelinkAssets }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportCapCut(e.target.files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="h-14 border-b border-slate-700 bg-slate-900 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold text-xl">
          <Icons.LayoutTemplate className="w-6 h-6" />
          <span>NovaCut</span>
        </div>
        <div className="h-4 w-px bg-slate-700 mx-2" />
        <span className="text-sm text-slate-300 font-medium truncate max-w-[200px]">
          {projectName}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".json" 
          onChange={handleFileChange}
        />
        
        <Button variant="secondary" size="sm" onClick={handleImportClick} className="gap-2 border border-slate-600">
          <Icons.Upload className="w-4 h-4" />
          导入剪映草稿
        </Button>

        {onRelinkAssets && (
          <Button variant="danger" size="sm" onClick={onRelinkAssets} className="gap-2 animate-pulse">
            <Icons.RotateCcw className="w-4 h-4" />
            关联素材文件夹
          </Button>
        )}

        <div className="h-4 w-px bg-slate-700 mx-2" />
        
        <span className="text-xs text-slate-500 mr-2">已自动保存</span>
        <Button variant="primary" size="sm" onClick={onExport} className="gap-2">
          <Icons.Download className="w-4 h-4" />
          导出
        </Button>
      </div>
    </header>
  );
};
