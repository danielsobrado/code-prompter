import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus, FolderPlus, Trash2 } from 'lucide-react';
import ExtensionFilter from './ExtensionFilter';
import path from 'path-browserify';

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
  extension?: string;
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
  const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([]);
  const [extensions, setExtensions] = useState<{ [key: string]: number }>({});
  const [includedExtensions, setIncludedExtensions] = useState<string[]>([]);
  const [excludedExtensions, setExcludedExtensions] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Extract file extension
  const getFileExtension = (filename: string): string => {
    const ext = path.extname(filename).toLowerCase();
    return ext ? ext : '(no extension)';
  };

  // Count extensions
  const countExtensions = (fileList: FileItem[]): { [key: string]: number } => {
    const extCount: { [key: string]: number } = {};
    
    fileList.forEach(file => {
      if (!file.isDirectory) {
        const ext = file.extension || getFileExtension(file.name);
        extCount[ext] = (extCount[ext] || 0) + 1;
      }
    });
    
    return extCount;
  };

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
        const extension = getFileExtension(file.name);
        
        newFiles.push({
          path: file.webkitRelativePath || file.name,
          name: file.name,
          isDirectory: false,
          isSelected: false,
          content,
          extension
        });
        
        filesProcessed++;
        if (filesProcessed === fileArray.length) {
          setFiles(prevFiles => {
            const updatedFiles = [...prevFiles, ...newFiles];
            // Update extensions count
            setExtensions(countExtensions(updatedFiles));
            return updatedFiles;
          });
        }
      };
      reader.readAsText(file);
    });
  };

  // Function to clear all files
  const handleClearAll = () => {
    setFiles([]);
    setExtensions({});
    setIncludedExtensions([]);
    setExcludedExtensions([]);
  };

  // Function to toggle file selection
  const toggleFileSelection = (item: FileItem) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.path === item.path ? { ...file, isSelected: !file.isSelected } : file
      )
    );
  };

  // Handle filter changes
  const handleFilterChange = useCallback((included: string[], excluded: string[]) => {
    setIncludedExtensions(included);
    setExcludedExtensions(excluded);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...files];
    
    // Apply inclusion filter if any
    if (includedExtensions.length > 0) {
      result = result.filter(file => {
        if (file.isDirectory) return true;
        const ext = file.extension || getFileExtension(file.name);
        return includedExtensions.includes(ext);
      });
    }
    
    // Apply exclusion filter 
    if (excludedExtensions.length > 0) {
      result = result.filter(file => {
        if (file.isDirectory) return true;
        const ext = file.extension || getFileExtension(file.name);
        return !excludedExtensions.includes(ext);
      });
    }
    
    setFilteredFiles(result);
  }, [files, includedExtensions, excludedExtensions]);

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
      const flattenedFiles = newFiles.flat();
      setFiles((prevFiles) => {
        const updatedFiles = [...prevFiles, ...flattenedFiles];
        setExtensions(countExtensions(updatedFiles));
        return updatedFiles;
      });
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
            const extension = getFileExtension(file.name);
            
            resolve([
              {
                path: entry.fullPath || file.name,
                name: file.name,
                isDirectory: false,
                isSelected: false,
                content,
                extension
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

  // Function to select all files of a specific extension
  const selectAllByExtension = (extension: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => {
        if (!file.isDirectory && (file.extension || getFileExtension(file.name)) === extension) {
          return { ...file, isSelected: true };
        }
        return file;
      })
    );
  };

  // Function to deselect all files of a specific extension
  const deselectAllByExtension = (extension: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => {
        if (!file.isDirectory && (file.extension || getFileExtension(file.name)) === extension) {
          return { ...file, isSelected: false };
        }
        return file;
      })
    );
  };

  // Render file list
  const renderFiles = (items: FileItem[]) => {
    const filesToRender = includedExtensions.length > 0 || excludedExtensions.length > 0 
      ? filteredFiles 
      : items;
      
    return filesToRender.map((item) => (
      <div key={item.path} className="pl-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={item.isSelected}
            onChange={() => toggleFileSelection(item)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm">{item.path}</span>
          {!item.isDirectory && (
            <span className="text-xs text-gray-500">{item.extension || getFileExtension(item.name)}</span>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-2">
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
        
        {/* Extension Filter Component */}
        {Object.keys(extensions).length > 0 && (
          <ExtensionFilter 
            extensions={extensions} 
            onFilterChange={handleFilterChange}
          />
        )}
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
      
      {/* File statistics */}
      {files.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {files.length} file(s) total • {filteredFiles.length} showing • {files.filter(f => f.isSelected).length} selected
        </div>
      )}
    </div>
  );
}