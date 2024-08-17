import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Folder, Trash } from "lucide-react";
import { SelectFile, SelectDirectory, HandleFileDrop } from '../../wailsjs/go/main/App';

interface FileActionsProps {
  setFiles: React.Dispatch<React.SetStateAction<any[]>>;
}

const FileActions: React.FC<FileActionsProps> = ({ setFiles }) => {
  const handleAddFile = async () => {
    try {
      const file = await SelectFile();
      if (file) {
        await HandleFileDrop([file]);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  const handleAddFolder = async () => {
    try {
      const folder = await SelectDirectory();
      if (folder) {
        await HandleFileDrop([folder]);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
    }
  };

  return (
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
  );
};

export default FileActions;