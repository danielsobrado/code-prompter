import React, { useState } from 'react';
import { HandleFileDrop } from '../../wailsjs/go/main/App';
import { Upload } from "lucide-react";

interface DragDropAreaProps {
  children: React.ReactNode;
}

const DragDropArea: React.FC<DragDropAreaProps> = ({ children }) => {
  const [isDragging, setIsDragging] = useState(false);

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
      const entries = Array.from(items)
        .filter(item => item.kind === 'file')
        .map(item => item.webkitGetAsEntry())
        .filter((entry): entry is FileSystemEntry => entry !== null);

      const paths = await traverseFileSystemEntries(entries);
      
      try {
        await HandleFileDrop(paths);
      } catch (error) {
        console.error("Error handling file drop:", error);
      }
    }
  };

  const traverseFileSystemEntries = async (entries: FileSystemEntry[]): Promise<string[]> => {
    const paths: string[] = [];

    const traverse = async (entry: FileSystemEntry, path: string = '') => {
      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;
        return new Promise<void>((resolve) => {
          fileEntry.file((file: File) => {
            paths.push(path + file.name);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();
        return new Promise<void>((resolve) => {
          dirReader.readEntries(async (entries) => {
            for (const entry of entries) {
              await traverse(entry, path + dirEntry.name + '/');
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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative ${isDragging ? 'bg-blue-100' : ''}`}
    >
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-200 bg-opacity-50 z-10">
          <Upload size={48} className="text-blue-500" />
        </div>
      )}
      {children}
    </div>
  );
};

export default DragDropArea;