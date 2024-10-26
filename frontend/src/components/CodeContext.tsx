import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus, FolderPlus, Trash2 } from 'lucide-react';

// Extend HTMLInputElement to include directory selection attributes
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
    directory?: string;
  }
}

export interface FileItem {
  path: string;
  name: string;
  isDirectory: boolean;
  isSelected: boolean;
  content?: string;
  children?: FileItem[];
}

export interface SelectedFile {
  path: string;
  content: string;
}

interface CodeContextProps {
  onSelectedFilesChange: (files: SelectedFile[]) => void;
}

export default function CodeContext({ onSelectedFilesChange }: CodeContextProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Function to add files
  const handleAddFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const fileArray = Array.from(fileList);
      readFiles(fileArray);
    }
  };

  // Function to add folders
  const handleAddFolders = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const fileArray = Array.from(fileList);
      readFiles(fileArray);
    }
  };

  // Function to read files
  const readFiles = (fileArray: File[]) => {
    const newFiles: FileItem[] = [];
    let filesProcessed = 0;

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        newFiles.push({
          path: file.webkitRelativePath || file.name,
          name: file.name,
          isDirectory: false,
          isSelected: false,
          content,
        });
        filesProcessed++;
        if (filesProcessed === fileArray.length) {
          setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        }
      };
      reader.readAsText(file);
    });
  };

  // Function to clear all files
  const handleClearAll = () => {
    setFiles([]);
  };

  // Function to toggle file selection
  const toggleFileSelection = (item: FileItem) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.path === item.path ? { ...file, isSelected: !file.isSelected } : file
      )
    );
  };

  // Collect selected files and notify parent component
  useEffect(() => {
    const collectSelectedFilesContent = (items: FileItem[]): SelectedFile[] => {
      return items
        .filter((item) => item.isSelected && !item.isDirectory)
        .map((item) => ({
          path: item.path,
          content: item.content || '',
        }));
    };

    const selectedFilesArray = collectSelectedFilesContent(files);
    onSelectedFilesChange(selectedFilesArray);
  }, [files, onSelectedFilesChange]);

  // Handle file/folder drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const items = event.dataTransfer.items;
    const filePromises: Promise<FileItem[]>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        filePromises.push(readEntry(item));
      }
    }

    Promise.all(filePromises).then((newFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...newFiles.flat()]);
    });
  };

  const readEntry = (entry: FileSystemEntry): Promise<FileItem[]> => {
    return new Promise((resolve) => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result as string;
            resolve([
              {
                path: entry.fullPath || file.name,
                name: file.name,
                isDirectory: false,
                isSelected: false,
                content,
              },
            ]);
          };
          reader.readAsText(file);
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();
        dirReader.readEntries((entries: FileSystemEntry[]) => {
          const entryPromises = entries.map((e) => readEntry(e));
          Promise.all(entryPromises).then((results) => {
            resolve(results.flat());
          });
        });
      } else {
        resolve([]);
      }
    });
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Render file list
  const renderFiles = (items: FileItem[]) => {
    return items.map((item) => (
      <div key={item.path} className="pl-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={item.isSelected}
            onChange={() => toggleFileSelection(item)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">{item.path}</span>
        </div>
      </div>
    ));
  };

  return (
    <div className="mt-4">
      <div className="flex space-x-2">
        <Button onClick={() => fileInputRef.current?.click()}>
          <FilePlus className="mr-2 h-4 w-4" /> Add File
        </Button>
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleAddFiles}
        />
        <Button onClick={() => folderInputRef.current?.click()}>
          <FolderPlus className="mr-2 h-4 w-4" /> Add Folder
        </Button>
        <input
          type="file"
          ref={folderInputRef}
          className="hidden"
          webkitdirectory=""
          directory=""
          multiple
          onChange={handleAddFolders}
        />
        <Button variant="destructive" onClick={handleClearAll}>
          <Trash2 className="mr-2 h-4 w-4" /> Clear All
        </Button>
      </div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border rounded-md p-4 mt-4 h-[200px] overflow-auto bg-background"
      >
        {files.length > 0 ? (
          renderFiles(files)
        ) : (
          <p className="text-muted-foreground text-sm italic text-center">
            Drag and drop files or folders here, or use the buttons above to add files.
          </p>
        )}
      </div>
    </div>
  );
}