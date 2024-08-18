import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SelectFile, SelectDirectory, ProcessFolder, ReadFileContent } from '../../wailsjs/go/main/App';
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';
import { FileTreeComponent } from './FileTreeComponent';
import { FileOperations } from './FileOperations';
import { DragAndDropHandler } from './DragAndDropHandler';

interface FileItem {
  path: string;
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

  useEffect(() => {
    const handleFilesDropped = async (droppedFiles: string[]) => {
      for (const file of droppedFiles) {
        try {
          const content = await ReadFileContent(file);
          addFileToStructure(file, content);
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

  useEffect(() => {
    const selectedContent = files
      .filter(file => file.isSelected)
      .map(file => `File: ${file.path}\n${file.content || ''}`)
      .join('\n\n');
    onSelectedFilesChange(selectedContent);
  }, [files, onSelectedFilesChange]);

  const addFileToStructure = (filePath: string, content: string) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const parts = filePath.split('/');
      let currentLevel = newFiles;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLast = i === parts.length - 1;
        let existingItem = currentLevel.find(item => item.path.endsWith(part));

        if (existingItem && existingItem.isDirectory && !isLast) {
          currentLevel = existingItem.children!;
        } else if (isLast) {
          if (!existingItem) {
            existingItem = { 
              path: filePath, 
              isDirectory: false, 
              content: content,
              isSelected: false
            };
            currentLevel.push(existingItem);
          } else {
            existingItem.content = content;
          }
        } else {
          if (!existingItem) {
            existingItem = { 
              path: parts.slice(0, i + 1).join('/'),
              isDirectory: true,
              children: [],
              isOpen: true,
              isSelected: false
            };
            currentLevel.push(existingItem);
          }
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
        const content = await ReadFileContent(file);
        addFileToStructure(file, content);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const handleAddFolder = async () => {
    try {
      const folder = await SelectDirectory();
      if (folder) {
        const processedFiles = await ProcessFolder(folder, {
          recursive: true,
          ignoreSuffixes: ".env,.log,.json,.gitignore,.npmrc,.prettierrc",
          ignoreFolders: ".git,.vscode,.idea,node_modules,venv,build,dist,coverage,out,next",
        });
        for (const file of processedFiles) {
          const content = await ReadFileContent(file);
          addFileToStructure(file, content);
        }
      }
    } catch (error) {
      console.error("Error processing folder:", error);
    }
  };

  const toggleFolder = (path: string) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const toggleItem = (items: FileItem[]) => {
        for (let item of items) {
          if (item.path === path) {
            item.isOpen = !item.isOpen;
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
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const toggleItem = (items: FileItem[]) => {
        for (let item of items) {
          if (item.path === path) {
            item.isSelected = !item.isSelected;
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
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const removeItem = (items: FileItem[]): FileItem[] => {
        return items.filter(item => {
          if (item.path === path) {
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

  const clearAll = () => {
    setFiles([]);
  };

  const handleFileDrop = (entry: any) => {
    if (entry.isFile) {
      entry.file((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          addFileToStructure(entry.fullPath, content);
        };
        reader.readAsText(file);
      });
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      dirReader.readEntries((entries: any[]) => {
        for (let i = 0; i < entries.length; i++) {
          handleFileDrop(entries[i]);
        }
      });
    }
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