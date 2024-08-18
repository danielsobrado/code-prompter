import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Folder, File, X } from "lucide-react";
import { FileItem as FileItemType } from './CodeContext';

interface FileItemProps {
  file: FileItemType;
  onToggle: () => void;
  onRemove: () => void;
}

const FileItem: React.FC<FileItemProps> = ({ file, onToggle, onRemove }) => {
  // Extract the file name from the path
  const fileName = file.path.split('/').pop() || file.path;

  return (
    <li className="flex items-center justify-between bg-gray-100 p-2 rounded">
      <span className="flex items-center">
        <Checkbox checked={file.isSelected} onCheckedChange={onToggle} />
        {file.isDirectory ? (
          <Folder className="ml-2 mr-2" size={16} />
        ) : (
          <File className="ml-2 mr-2" size={16} />
        )}
        {fileName}
      </span>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        <X size={16} />
      </Button>
    </li>
  );
};

export default FileItem;