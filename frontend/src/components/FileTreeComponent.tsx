import React from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { File, Folder, ChevronDown, ChevronRight, X } from "lucide-react";

interface FileItem {
  path: string;
  name: string;
  isDirectory: boolean;
  children?: FileItem[];
  isOpen?: boolean;
  isSelected?: boolean;
  content?: string;
}

interface FileTreeComponentProps {
  files: FileItem[];
  onToggleFolder: (path: string) => void;
  onToggleSelect: (path: string) => void;
  onRemoveFile: (path: string) => void;
}

export const FileTreeComponent: React.FC<FileTreeComponentProps> = ({
  files,
  onToggleFolder,
  onToggleSelect,
  onRemoveFile
}) => {
  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.path} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center">
          <Checkbox
            checked={item.isSelected}
            onCheckedChange={() => onToggleSelect(item.path)}
          />
          {item.isDirectory ? (
            <Button variant="ghost" size="sm" onClick={() => onToggleFolder(item.path)}>
              {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
          ) : (
            <File className="mr-2" size={16} />
          )}
          <span>{item.name}</span>
          <Button variant="ghost" size="sm" onClick={() => onRemoveFile(item.path)}>
            <X size={16} />
          </Button>
        </div>
        {item.isDirectory && item.isOpen && item.children && renderFileTree(item.children, level + 1)}
      </div>
    ));
  };

  return <>{renderFileTree(files)}</>;
};