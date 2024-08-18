import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SelectFile, SelectDirectory, HandleFileDrop } from '../../wailsjs/go/main/App';
import { Folder, File, ChevronRight, ChevronDown, X, Plus, Trash } from "lucide-react";
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';

interface FileItem {
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
  isOpen?: boolean;
  isSelected?: boolean;
  content?: string;
}

export default function CodeContext({ onSelectedFilesChange }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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

  const addFileToStructure = (filePath: string, content: string) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const parts = filePath.split('/');
      let currentLevel = newFiles;

      parts.forEach((part, index) => {
        const isLast = index === parts.length - 1;
        const existingItem = currentLevel.find(item => item.path.endsWith(part));

        if (existingItem && existingItem.isDirectory && !isLast) {
          currentLevel = existingItem.children!;
        } else if (isLast) {
          currentLevel.push({ 
            path: filePath, 
            isDirectory: false, 
            content: content,
            isSelected: false
          });
        } else {
          const newDir: FileItem = { 
            path: parts.slice(0, index + 1).join('/'),
            isDirectory: true,
            children: [],
            isOpen: true,
            isSelected: false
          };
          currentLevel.push(newDir);
          currentLevel = newDir.children!;
        }
      });

      return newFiles;
    });
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

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.path} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center">
          <Checkbox
            checked={item.isSelected}
            onCheckedChange={() => toggleSelect(item.path)}
          />
          {item.isDirectory ? (
            <Button variant="ghost" size="sm" onClick={() => toggleFolder(item.path)}>
              {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          ) : (
            <File className="mr-2" size={16} />
          )}
          <span>{item.path.split('/').pop()}</span>
          <Button variant="ghost" size="sm" onClick={() => removeFile(item.path)}>
            <X size={16} />
          </Button>
        </div>
        {item.isDirectory && item.isOpen && item.children && renderFileTree(item.children, level + 1)}
      </div>
    ));
  };

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const items = e.dataTransfer.items;
    if (items) {
      const files = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      
      if (files.length > 0) {
        try {
          const fileNames = files.map(file => file.name);
          await HandleFileDrop(fileNames);
        } catch (error) {
          console.error("Error handling file drop:", error);
        }
      }
    }
  };

  const traverseFileSystemEntries = async (entries) => {
    const paths = [];
    
    const traverse = async (entry, path = '') => {
      if (entry.isFile) {
        return new Promise<void>((resolve) => {
          entry.file((file: File) => {
            paths.push(path + file.name);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (entries) => {
            for (let i = 0; i < entries.length; i++) {
              await traverse(entries[i], path + entry.name + '/');
            }
            resolve();
          });
        });
      }
    };

    for (const entry of entries) {
      await traverse(entry);
    }

    return paths;
  };

  return (
    <div className="mt-4">
      <Card>
        <CardContent 
          className={`h-60 overflow-y-auto p-4 ${isDragging ? 'bg-blue-100' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={handleDrop}
        >
          {renderFileTree(files)}
          {files.length === 0 && (
            <p className="text-gray-500 text-center mt-4">
              Drag and drop files or folders here, or use the buttons below to add them.
            </p>
          )}
        </CardContent>
      </Card>
      <div className="mt-2 space-x-2">
        <Button variant="outline" onClick={handleAddFile}>
          <Plus size={16} className="mr-2" /> Add File
        </Button>
        <Button variant="outline" onClick={handleAddFolder}>
          <Folder size={16} className="mr-2" /> Add Folder
        </Button>
        <Button variant="outline" onClick={() => setFiles([])}>
          <Trash size={16} className="mr-2" /> Clear All
        </Button>
      </div>
    </div>
  );
}