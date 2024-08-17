import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';
import FileList from './FileList';
import DragDropArea from './DragDropArea';
import FileActions from './FileActions';

export interface FileItem {
  path: string;
  isDirectory: boolean;
  isOpen?: boolean;
  isSelected?: boolean;
  content?: string;
}

export default function CodeContext({ onSelectedFilesChange }) {
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    const handleFilesDropped = (droppedFiles: string[]) => {
      const newFiles = droppedFiles.map(file => ({
        path: file,
        isDirectory: false,
        isSelected: false,
        content: ''
      }));
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    EventsOn("files-dropped", handleFilesDropped);

    return () => {
      EventsOff("files-dropped");
    };
  }, []);

  const handleFileToggle = (path: string) => {
    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.path === path ? { ...file, isSelected: !file.isSelected } : file
      )
    );
  };

  const handleFileRemove = (path: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.path !== path));
  };

  return (
    <div className="mt-4">
      <Card>
        <DragDropArea>
          <CardContent className="h-60 overflow-y-auto p-4">
            <FileList
              files={files}
              onFileToggle={handleFileToggle}
              onFileRemove={handleFileRemove}
            />
          </CardContent>
        </DragDropArea>
      </Card>
      <FileActions setFiles={setFiles} />
    </div>
  );
}