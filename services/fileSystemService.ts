
// This service uses the File System Access API
// Note: This API works best in Chrome/Edge desktop browsers.

export interface FileMap {
  [fileName: string]: File;
}

export const pickDirectoryAndFindFiles = async (targetFileNames: Set<string>): Promise<FileMap> => {
  if (!('showDirectoryPicker' in window)) {
    alert("您的浏览器不支持文件夹访问 API (File System Access API)。请使用 Chrome 或 Edge 桌面版。");
    return {};
  }

  try {
    // 1. Ask user to select a directory
    // @ts-ignore - types for this API might be missing in standard lib
    const dirHandle = await window.showDirectoryPicker();
    
    const foundFiles: FileMap = {};
    
    // 2. Recursive function to walk through directories
    async function scanDirectory(handle: any) {
      for await (const entry of handle.values()) {
        if (entry.kind === 'file') {
          // Check if this file is one of the ones we are looking for
          if (targetFileNames.has(entry.name)) {
            const file = await entry.getFile();
            foundFiles[entry.name] = file;
          }
        } else if (entry.kind === 'directory') {
          // Recursively scan subdirectories
          await scanDirectory(entry);
        }
      }
    }

    await scanDirectory(dirHandle);
    return foundFiles;

  } catch (error) {
    // User cancelled or error
    console.log("Directory pick cancelled or failed", error);
    return {};
  }
};
