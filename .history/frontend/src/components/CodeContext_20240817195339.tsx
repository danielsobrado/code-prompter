import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EventsOn, EventsOff } from '../../wailsjs/runtime/runtime';
import { ReadFileContent } from '../../wailsjs/go/main/App';
import FileList from './FileList';
import DragDropArea from './DragDropArea';
import FileActions from './FileActions';
import FinalPrompt from './FinalPrompt';

export interface FileItem {
  path: string;
  isDirectory: boolean;
  isOpen?: boolean;
  isSelected?: boolean;
  content?: string;
}

export default function CodeContext() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);

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

  const handleFileToggle = async (path: string) => {
    const updatedFiles = files.map(file => {
      if (file.path === path) {
        return { ...file, isSelected: !file.isSelected };
      }
      return file;
    });
    setFiles(updatedFiles);

    const toggledFile = updatedFiles.find(file => file.path === path);
    if (toggledFile) {
      if (toggledFile.isSelected && !toggledFile.content) {
        try {
          const content = await ReadFileContent(path);
          toggledFile.content = content;
        } catch (error) {
          console.error("Error reading file content:", error);
        }
      }

      setSelectedFiles(updatedFiles.filter(file => file.isSelected));
    }
  };

  const handleFileRemove = (path: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.path !== path));
    setSelectedFiles(prevSelected => prevSelected.filter(file => file.path !== path));
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
      <FinalPrompt files={selectedFiles} />
    </div>
  );
}