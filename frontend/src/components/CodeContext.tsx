import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SelectFile, SelectDirectory, ProcessFolder, ReadFileContent, LogInfo } from '../../wailsjs/go/main/App';
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';
import { FileTreeComponent } from './FileTreeComponent';
import { FileOperations } from './FileOperations';
import { DragAndDropHandler } from './DragAndDropHandler';
import path from 'path-browserify';

interface FileItem {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: FileItem[];
  isOpen?: boolean;
  isSelected?: boolean;
  content?: string;
}

interface CodeContextProps {
  onSelectedFilesChange: (content: string) => void;
}

export default function CodeContext({ onSelectedFilesChange }: CodeContextProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [basePath, setBasePath] = useState("");

  const logFileProcessing = (method: string, filePath: string, normalizedPath: string) => {
    LogInfo(`[${method}] Original path: ${filePath}`);
    LogInfo(`[${method}] Normalized path: ${normalizedPath}`);
  };

  const normalizePath = (filePath: string): string => {
    const normalized = filePath.replace(/\\/g, '/');
    logFileProcessing("Normalize", filePath, normalized);
    if (basePath && normalized.startsWith(basePath)) {
      const relativePath = normalized.slice(basePath.length + 1); // +1 to remove leading slash
      logFileProcessing("Normalize (relative)", filePath, relativePath);
      return relativePath;
    }
    logFileProcessing("Normalize (absolute)", filePath, normalized);
    return normalized;
  };

  const getFileName = (filePath: string): string => {
    return path.basename(normalizePath(filePath));
  };

  useEffect(() => {
    const handleFilesDropped = async (droppedFiles: string[]) => {
      console.log("[Drag and Drop] Dropped files:", droppedFiles);
      if (droppedFiles.length > 0) {
        const commonPath = findCommonPath(droppedFiles);
        setBasePath(commonPath);
        console.log("[Drag and Drop] Common Base Path:", commonPath); 
      }
      for (const file of droppedFiles) {
        try {
          const normalizedPath = normalizePath(file);
          logFileProcessing("Drag and Drop", file, normalizedPath); 
          const content = await ReadFileContent(file);
          addFileToStructure(normalizedPath, content);
        } catch (error) {
          console.error(`Error reading file ${file}:`, error);
        }
      }
    };

    EventsOn("files-dropped", handleFilesDropped);
    return () => {
      EventsOff("files-dropped");
    };
  }, []);

  const findCommonPath = (paths: string[]): string => {
    if (paths.length === 0) return '';
    const parts = paths[0].split('/');
    let commonPath = '';
    for (let i = 0; i < parts.length; i++) {
      const part = parts.slice(0, i + 1).join('/');
      if (paths.every(path => path.startsWith(part))) {
        commonPath = part;
      } else {
        break;
      }
    }
    return commonPath;
  };

  useEffect(() => {
    const selectedContent = files
      .filter(file => file.isSelected && !file.isDirectory)
      .map(file => `File: ${file.path}\n${file.content || ''}`)
      .join('\n\n');
    onSelectedFilesChange(selectedContent);
  }, [files, onSelectedFilesChange]);

  const addFileToStructure = (filePath: string, content: string) => {
    console.log(`[addFileToStructure] Adding file to structure: ${filePath}`);
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const parts = normalizePath(filePath).split('/').filter(part => part !== '');
      let currentLevel = newFiles;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        const currentPath = '/' + parts.slice(0, i + 1).join('/');
        let existingItem = currentLevel.find(item => item.path === currentPath);

        if (!existingItem) {
          const newItem: FileItem = {
            path: currentPath,
            name: part,
            isDirectory: !isLast,
            children: isLast ? undefined : [],
            isOpen: true,
            isSelected: false,
            content: isLast ? content : undefined
          };
          currentLevel.push(newItem);
          existingItem = newItem;
          console.log(`[addFileToStructure] Created new item: ${JSON.stringify(newItem)}`);
        } else if (isLast && !existingItem.isDirectory) {
          // Update existing file
          existingItem.content = content;
          console.log(`[addFileToStructure] Updated existing file: ${existingItem.path}`);
        }

        if (!isLast) {
          currentLevel = existingItem.children!;
        }
      }

      return newFiles;
    });
  };

  const handleAddFile = async () => {
    try {
      const file = await SelectFile();
      if (file) {
        if (!basePath) {
          setBasePath(path.dirname(file));
        }
        const normalizedPath = normalizePath(file);
        logFileProcessing("Button - Add File", file, normalizedPath);
        const content = await ReadFileContent(file);
        addFileToStructure(normalizedPath, content);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const handleAddFolder = async () => {
    try {
      const folder = await SelectDirectory();
      if (folder) {
        if (!basePath) {
          setBasePath(folder);
        }
        const normalizedFolder = normalizePath(folder);
        console.log("[Button - Add Folder] Selected folder:", normalizedFolder);
        const processedFiles = await ProcessFolder(folder, {
          recursive: true,
          ignoreSuffixes: ".env,.log,.json,.gitignore,.npmrc,.prettierrc",
          ignoreFolders: ".git,.vscode,.idea,node_modules,venv,build,dist,coverage,out,next",
        });
        console.log("[Button - Add Folder] Processed files:", processedFiles);
        for (const file of processedFiles) {
          const normalizedPath = normalizePath(file);
          logFileProcessing("Button - Add Folder", file, normalizedPath);
          const content = await ReadFileContent(file);
          addFileToStructure(normalizedPath, content);
        }
      }
    } catch (error) {
      console.error("Error processing folder:", error);
    }
  };

  const toggleFolder = (path: string) => {
    console.log(`[toggleFolder] Toggling folder: ${path}`);
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const toggleItem = (items: FileItem[]) => {
        for (let item of items) {
          if (item.path === path) {
            item.isOpen = !item.isOpen;
            console.log(`[toggleFolder] Folder ${path} is now ${item.isOpen ? 'open' : 'closed'}`);
            return true;
          }
          if (item.children && toggleItem(item.children)) {
            return true;
          }
        }
        return false;
      };
      toggleItem(newFiles);
      return newFiles;
    });
  };

  const toggleSelect = (path: string) => {
    console.log(`[toggleSelect] Toggling selection for: ${path}`);
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const toggleItem = (items: FileItem[]) => {
        for (let item of items) {
          if (item.path === path) {
            item.isSelected = !item.isSelected;
            console.log(`[toggleSelect] Item ${path} is now ${item.isSelected ? 'selected' : 'unselected'}`);
            return true;
          }
          if (item.children && toggleItem(item.children)) {
            return true;
          }
        }
        return false;
      };
      toggleItem(newFiles);
      return newFiles;
    });
  };

  const removeFile = (path: string) => {
    console.log(`[removeFile] Removing file: ${path}`);
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const removeItem = (items: FileItem[]): FileItem[] => {
        return items.filter(item => {
          if (item.path === path) {
            console.log(`[removeFile] Removed item: ${item.path}`);
            return false;
          }
          if (item.children) {
            item.children = removeItem(item.children);
          }
          return true;
        });
      };
      return removeItem(newFiles);
    });
  };
  
  const handleFileDrop = async (entry: any) => {
    console.log("[handleFileDrop] Handling dropped file/folder:", entry.name);
    const traverseFileSystemEntry = async (fsEntry: any, path = '') => {
      if (fsEntry.isFile) {
        return new Promise<void>((resolve) => {
          fsEntry.file(async (file: File) => {
            const fullPath = normalizePath(path + file.name);
            logFileProcessing("Drag and Drop", path + file.name, fullPath); 
            const reader = new FileReader();
            reader.onload = async (e) => {
              const content = e.target?.result as string;
              await addFileToStructure(fullPath, content);
              resolve();
            };
            reader.readAsText(file);
          });
        });
      } else if (fsEntry.isDirectory) {
        const dirReader = fsEntry.createReader();
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (entries: any[]) => {
            for (let i = 0; i < entries.length; i++) {
              await traverseFileSystemEntry(entries[i], path + fsEntry.name + '/');
            }
            resolve();
          });
        });
      }
    };

    await traverseFileSystemEntry(entry);
  };

  const clearAll = () => {
    console.log("[clearAll] Clearing all files and folders");
    setFiles([]);
    setBasePath("");
  };

  return (
    <div className="mt-4">
      <Card>
        <DragAndDropHandler onFileDrop={handleFileDrop}>
          <CardContent className="h-60 overflow-y-auto p-4">
            <FileTreeComponent
              files={files}
              onToggleFolder={toggleFolder}
              onToggleSelect={toggleSelect}
              onRemoveFile={removeFile}
            />
            {files.length === 0 && (
              <p className="text-gray-500 text-center mt-4">
                Drag and drop files or folders here, or use the buttons below to add them.
              </p>
            )}
          </CardContent>
        </DragAndDropHandler>
      </Card>
      <FileOperations
        onAddFile={handleAddFile}
        onAddFolder={handleAddFolder}
        onClearAll={clearAll}
      />
    </div>
  );
}