// src/components/CodeContext.tsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
// Import CheckSquare icon
import { FilePlus, FolderPlus, Trash2, GitBranch, CheckSquare } from 'lucide-react';
import ExtensionFilter from './ExtensionFilter';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import path from 'path-browserify';

// Extend HTMLInputElement to include directory selection attributes
declare module 'react' {
  interface InputHTMLAttributes<T> extends React.HTMLAttributes<T> {
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
  const [respectGitignore, setRespectGitignore] = useState<boolean>(true);
  const [gitignorePatterns, setGitignorePatterns] = useState<string[]>([]);
  const [gitignoreFound, setGitignoreFound] = useState<boolean>(false);

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
          isSelected: false, // Default to not selected
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
      // Handle cases where file might not be readable as text
      reader.onerror = () => {
        console.warn(`Could not read file: ${file.name}`);
        filesProcessed++;
        if (filesProcessed === fileArray.length) {
          setFiles(prevFiles => {
            const updatedFiles = [...prevFiles, ...newFiles];
            setExtensions(countExtensions(updatedFiles));
            return updatedFiles;
          });
        }
      };
      reader.readAsText(file);
    });
  };


  // Function to add files
  const handleAddFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const fileArray = Array.from(fileList);
      readFiles(fileArray);
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Parse .gitignore content to extract patterns
  const parseGitignore = (content: string): string[] => {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line =>
        line && !line.startsWith('#') && !line.startsWith('!')
      );
  };

  // Function to add folders
  const handleAddFolders = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const fileArray = Array.from(fileList);

      // Check if there's a .gitignore file in the folder
      const gitignoreFile = fileArray.find(file =>
        file.name === '.gitignore' || file.webkitRelativePath?.endsWith('/.gitignore')
      );

      if (gitignoreFile && respectGitignore) {
        // Read the .gitignore file to extract patterns
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const patterns = parseGitignore(content);
          setGitignorePatterns(patterns);
          setGitignoreFound(true);

          // Filter files based on gitignore patterns if respectGitignore is enabled
          const filteredFileArray = respectGitignore
            ? filterFilesByGitignore(fileArray, patterns)
            : fileArray;

          readFiles(filteredFileArray);
        };
        reader.readAsText(gitignoreFile);
      } else {
        // If no gitignore or respectGitignore is off, process all files
        // Apply default ignores if respectGitignore is false but we still want basic ignores
        const patternsToUse = !respectGitignore ? [] : gitignorePatterns; // Use existing patterns if respectGitignore is on, else none
        const filteredFileArray = filterFilesByGitignore(fileArray, patternsToUse);
        readFiles(filteredFileArray);
      }
       // Reset input value to allow selecting the same folder again
       if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  // Filter files based on gitignore patterns
  const filterFilesByGitignore = (files: File[], patterns: string[]): File[] => {
    if (!patterns || patterns.length === 0) return files; // No patterns, return all files

    return files.filter(file => {
      const relativePath = file.webkitRelativePath || file.name;

      // Check if file path matches any gitignore pattern
      return !patterns.some(pattern => {
        // Handle directory patterns (e.g., node_modules/, /build/)
        if (pattern.endsWith('/')) {
          const dirName = pattern.slice(0, -1);
          return relativePath.includes(`/${dirName}/`) ||
                 relativePath.startsWith(`${dirName}/`) ||
                 (relativePath.includes('/') && path.dirname(relativePath).endsWith(dirName)) || // Check parent dir
                 (!relativePath.includes('/') && relativePath === dirName); // Top-level dir
        }

        // Handle wildcard patterns (e.g., *.log, /logs/*.log)
        if (pattern.includes('*')) {
          // Basic wildcard matching, might need more robust library like minimatch for full gitignore spec
          const regexPattern = pattern
            .replace(/\./g, '\\.') // Escape dots
            .replace(/\*\*/g, '.+') // Match multiple directories
            .replace(/\*/g, '[^/]*'); // Match anything except slash
          const regex = new RegExp(`(^|/)${regexPattern}$`); // Match end of path or before slash
          return regex.test(relativePath);
        }

        // Handle specific file or directory names (e.g., .env, config.js)
        const baseName = path.basename(relativePath);
        return relativePath === pattern || // Exact match
               relativePath.startsWith(`${pattern}/`) || // Starts with the path (directory)
               baseName === pattern; // Matches the filename itself
      });
    });
  };

  // Function to clear all files
  const handleClearAll = () => {
    setFiles([]);
    setExtensions({});
    setIncludedExtensions([]);
    setExcludedExtensions([]);
    setGitignoreFound(false);
    setGitignorePatterns([]);
     // Reset input refs
     if (fileInputRef.current) fileInputRef.current.value = '';
     if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // Function to toggle file selection
  const toggleFileSelection = (item: FileItem) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.path === item.path ? { ...file, isSelected: !file.isSelected } : file
      )
    );
  };

  // Utility to read file content from a FileSystemFileEntry
  const readFileContent = (fileEntry: FileSystemFileEntry): Promise<string> => {
    return new Promise((resolve, reject) => { // Add reject
      fileEntry.file((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = (error) => {
             console.error(`Error reading file ${file.name}:`, error);
             reject(error); // Reject promise on error
        };
        reader.readAsText(file);
      }, (error) => { // Add error handler for file() method
        console.error(`Error accessing file entry ${fileEntry.name}:`, error);
        reject(error);
      });
    });
  };


  // Handle filter changes
  const handleFilterChange = useCallback((included: string[], excluded: string[]) => {
    setIncludedExtensions(included);
    setExcludedExtensions(excluded);
  }, []);

  const readEntry = async (entry: FileSystemEntry, gitignorePatternsToApply: string[]): Promise<FileItem[]> => {
    const entryPath = (entry as any).fullPath || entry.name; // Use fullPath if available

    // Check if entry should be ignored based on gitignore patterns
    const shouldIgnore = (currentPath: string): boolean => {
      if (!gitignorePatternsToApply || gitignorePatternsToApply.length === 0) return false;

      // Ensure path starts with '/' for root matching, or handle relative matching
      const normalizedPath = currentPath.startsWith('/') ? currentPath : `/${currentPath}`;

      return gitignorePatternsToApply.some(pattern => {
          // Basic matching logic - consider using a library like 'ignore' for full spec compliance
          const baseName = path.basename(normalizedPath);
          if (pattern.endsWith('/')) { // Directory pattern
              const dirPattern = pattern.slice(0, -1);
              return normalizedPath.includes(`/${dirPattern}/`) || normalizedPath.endsWith(`/${dirPattern}`);
          }
          if (pattern.includes('*')) { // Wildcard pattern (basic)
              const regex = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'));
              return regex.test(normalizedPath) || regex.test(baseName);
          }
          // Specific file or directory name
          return normalizedPath.endsWith(`/${pattern}`) || baseName === pattern;
      });
    };


    if (shouldIgnore(entryPath)) {
        // console.log(`Ignoring (gitignore): ${entryPath}`);
        return [];
    }


    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      try {
        const content = await readFileContent(fileEntry);
        const extension = getFileExtension(entry.name);
        return [{
          path: entryPath,
          name: entry.name,
          isDirectory: false,
          isSelected: false, // Default new files to not selected
          content,
          extension
        }];
      } catch (error) {
        console.error(`Failed to process file ${entryPath}:`, error);
        return []; // Skip file if reading fails
      }
    } else if (entry.isDirectory) {
        const dirEntry = entry as FileSystemDirectoryEntry;
        const dirReader = dirEntry.createReader();

        return new Promise<FileItem[]>((resolve, reject) => {
            const allEntries: FileSystemEntry[] = [];
            const readBatch = () => {
                dirReader.readEntries(async (batchEntries) => {
                    if (batchEntries.length > 0) {
                        allEntries.push(...batchEntries);
                        readBatch(); // Read next batch
                    } else {
                        // Finished reading directory
                        const entryPromises = allEntries.map(e => readEntry(e, gitignorePatternsToApply));
                        try {
                            const results = await Promise.all(entryPromises);
                            resolve(results.flat());
                        } catch (error) {
                            console.error(`Error processing directory ${entryPath}:`, error);
                            reject(error); // Propagate error
                        }
                    }
                }, (error) => {
                    console.error(`Error reading directory entries for ${entryPath}:`, error);
                    reject(error); // Propagate readEntries error
                });
            };
            readBatch(); // Start reading batches
        });
    } else {
      return []; // Ignore other entry types
    }
  };

  // Handle file/folder drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const items = event.dataTransfer.items;
    const entryPromises: Promise<FileItem[]>[] = [];

    // Get all entries first
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        entries.push(item);
      }
    }

    // Check for .gitignore among the dropped items
    const processEntries = async () => {
      let currentGitignorePatterns = gitignorePatterns; // Use existing patterns by default

      if (respectGitignore) {
         try {
            // Look for .gitignore at the root of the drop
            const rootGitignoreEntry = entries.find(e => e.isFile && e.name === '.gitignore');
            if (rootGitignoreEntry) {
                const gitignoreText = await readFileContent(rootGitignoreEntry as FileSystemFileEntry);
                if (gitignoreText) {
                    const newPatterns = parseGitignore(gitignoreText);
                    // console.log("Found .gitignore in drop, patterns:", newPatterns);
                    currentGitignorePatterns = newPatterns; // Use patterns from dropped file
                    setGitignorePatterns(newPatterns); // Update state as well
                    setGitignoreFound(true);
                }
            }
            // If no root .gitignore, keep existing patterns if any
            else if (gitignorePatterns.length > 0) {
                 // console.log("Using existing gitignore patterns:", gitignorePatterns);
                 currentGitignorePatterns = gitignorePatterns;
            } else {
                // console.log("No .gitignore found in drop or state.");
                currentGitignorePatterns = []; // Ensure it's empty if none found
            }
         } catch (error) {
             console.error("Error reading dropped .gitignore:", error);
             currentGitignorePatterns = respectGitignore ? gitignorePatterns : []; // Fallback safely
         }
      } else {
           // console.log("Respect gitignore is off, ignoring patterns.");
           currentGitignorePatterns = []; // Ignore patterns if respectGitignore is off
      }


      // Process entries with the determined gitignore patterns
      for (const entry of entries) {
          // Don't re-process the .gitignore file itself if we already read it
          if (entry.isFile && entry.name === '.gitignore' && currentGitignorePatterns.length > 0) {
              continue;
          }
          entryPromises.push(readEntry(entry, currentGitignorePatterns));
      }

      try {
        const newFilesArrays = await Promise.all(entryPromises);
        const flattenedFiles = newFilesArrays.flat();
        // Filter out duplicates based on path before adding
        setFiles((prevFiles) => {
            const existingPaths = new Set(prevFiles.map(f => f.path));
            const uniqueNewFiles = flattenedFiles.filter(nf => !existingPaths.has(nf.path));
            const updatedFiles = [...prevFiles, ...uniqueNewFiles];
            setExtensions(countExtensions(updatedFiles));
            return updatedFiles;
          });
      } catch(error) {
          console.error("Error processing dropped items:", error);
          // Handle error appropriately, maybe show a message to the user
      }
    };

    processEntries();
  };


  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault(); // Necessary to allow drop
  };

  // Apply filters
  useEffect(() => {
    let result = [...files];

    // Apply gitignore filter if respectGitignore is true and patterns exist
    if (respectGitignore && gitignorePatterns.length > 0) {
      result = result.filter(file => {
        const relativePath = file.path;
        return !gitignorePatterns.some(pattern => {
             // Use the same logic as filterFilesByGitignore or a dedicated library
            const baseName = path.basename(relativePath);
            if (pattern.endsWith('/')) { // Directory pattern
                const dirPattern = pattern.slice(0, -1);
                return relativePath.includes(`/${dirPattern}/`) || relativePath.startsWith(`${dirPattern}/`) || baseName === dirPattern;
            }
            if (pattern.includes('*')) { // Wildcard pattern (basic)
                const regex = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'));
                return regex.test(relativePath) || regex.test(baseName);
            }
            // Specific file/directory name
            return relativePath === pattern || relativePath.startsWith(`${pattern}/`) || baseName === pattern;
        });
      });
    }


    // Apply inclusion filter if any
    if (includedExtensions.length > 0) {
      result = result.filter(file => {
        if (file.isDirectory) return false; // Exclude directories explicitly if filtering
        const ext = file.extension || getFileExtension(file.name);
        return includedExtensions.includes(ext);
      });
    }

    // Apply exclusion filter
    if (excludedExtensions.length > 0) {
      result = result.filter(file => {
        if (file.isDirectory) return true; // Keep directories unless explicitly excluded? Decide behavior. Usually keep.
        const ext = file.extension || getFileExtension(file.name);
        return !excludedExtensions.includes(ext);
      });
    }

    setFilteredFiles(result);
  }, [files, includedExtensions, excludedExtensions, respectGitignore, gitignorePatterns]);


  // Collect selected files and notify parent component
  useEffect(() => {
    // Use filteredFiles to determine what is currently 'selectable' based on filters
    const selectedAndFilteredFiles = files.filter(file =>
        file.isSelected && // Is actually selected
        !file.isDirectory && // Is a file
        filteredFiles.some(ff => ff.path === file.path) // Is currently visible in the filtered list
    );

    const selectedFilesArray: SelectedFile[] = selectedAndFilteredFiles.map(item => ({
        path: item.path,
        content: item.content || '',
    }));

    onSelectedFilesChange(selectedFilesArray);
  }, [files, filteredFiles, onSelectedFilesChange]); // Depend on filteredFiles now

  // Function to select all *visible* files
  const handleSelectAllVisible = () => {
    // Get the paths of all currently visible files (non-directories) from filteredFiles
    const visibleFilePaths = filteredFiles
      .filter(f => !f.isDirectory) // Only consider files
      .map(f => f.path);

    if (visibleFilePaths.length === 0) return; // Nothing visible to select

    setFiles(prevFiles =>
      prevFiles.map(file =>
        // If the file's path is in the list of visible file paths, select it
        visibleFilePaths.includes(file.path)
          ? { ...file, isSelected: true }
          : file // Otherwise, leave its selection state unchanged
      )
    );
  };


  // Render file list
  const renderFiles = (itemsToRender: FileItem[]) => {
    // No need to check inclusion/exclusion state here as `itemsToRender` will be `filteredFiles`
    if (itemsToRender.length === 0 && files.length > 0) {
         return (
            <p className="text-muted-foreground text-sm italic text-center p-4">
                No files match the current filters.
            </p>
        );
    }

    return itemsToRender.map((item) => (
      <div key={item.path} className="pl-1 pr-2 py-0.5 hover:bg-accent rounded transition-colors"> {/* Adjust padding/margin */}
        <div className="flex items-center space-x-2">
          <Checkbox // Changed from input to Checkbox component
            id={`checkbox-${item.path}`} // Add unique id for label association
            checked={item.isSelected}
            onCheckedChange={() => toggleFileSelection(item)} // Use onCheckedChange
            className="shrink-0" // Prevent checkbox from shrinking
          />
          {/* Associate label with checkbox */}
          <Label htmlFor={`checkbox-${item.path}`} className="flex-grow truncate cursor-pointer">
             <span className="text-sm">{item.path}</span>
             {/* {!item.isDirectory && ( // Don't show extension if filtering already does it
                 <span className="text-xs text-gray-500 ml-1">({item.extension || getFileExtension(item.name)})</span>
             )} */}
           </Label>
        </div>
      </div>
    ));
  };

  const totalSelectedCount = files.filter(f => f.isSelected && !f.isDirectory).length;
  const visibleSelectedCount = filteredFiles.filter(f => f.isSelected && !f.isDirectory).length;
  const totalFileCount = files.filter(f => !f.isDirectory).length;
  const visibleFileCount = filteredFiles.filter(f => !f.isDirectory).length;


  return (
    <div className="mt-4">
      {/* Top row controls */}
      <div className="flex flex-wrap items-center gap-2 mb-2"> {/* Use flex-wrap and gap */}
        {/* File/Folder Buttons */}
        <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => fileInputRef.current?.click()}>
              <FilePlus className="mr-1.5 h-4 w-4" /> Add File(s)
            </Button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              className="hidden"
              onChange={handleAddFiles}
              aria-label="Add files"
            />
            <Button size="sm" onClick={() => folderInputRef.current?.click()}>
              <FolderPlus className="mr-1.5 h-4 w-4" /> Add Folder
            </Button>
            <input
              type="file"
              ref={folderInputRef}
              className="hidden"
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleAddFolders}
              aria-label="Add folder"
            />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
            {/* Add Select All Button */}
            <Button size="sm" variant="outline" onClick={handleSelectAllVisible} disabled={visibleFileCount === 0}>
              <CheckSquare className="mr-1.5 h-4 w-4" /> Select All Visible
            </Button>
            <Button size="sm" variant="destructive" onClick={handleClearAll} disabled={files.length === 0}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Clear All
            </Button>
        </div>

        {/* Extension Filter Component */}
        {Object.keys(extensions).length > 0 && (
          <ExtensionFilter
            extensions={extensions}
            onFilterChange={handleFilterChange}
          />
        )}

        {/* Gitignore Respect Checkbox - moved slightly */}
        <div className="flex items-center space-x-2 ml-auto"> {/* Push to right */}
          <Checkbox
            id="respect-gitignore"
            checked={respectGitignore}
            onCheckedChange={(checked) => {
                setRespectGitignore(!!checked);
                // Optionally re-apply filters immediately or just let the useEffect handle it
            }}
          />
          <Label
            htmlFor="respect-gitignore"
            className="flex items-center cursor-pointer text-sm whitespace-nowrap"
          >
            <GitBranch className="mr-1 h-4 w-4 text-muted-foreground" />
            Filter using .gitignore
            {gitignoreFound && respectGitignore && ( // Only show "Found" if respected
              <span className="ml-1 text-xs rounded-full bg-green-100 text-green-800 px-1.5 py-0.5">
                Found
              </span>
            )}
             {!gitignoreFound && respectGitignore && ( // Show if respected but none found yet
              <span className="ml-1 text-xs rounded-full bg-yellow-100 text-yellow-800 px-1.5 py-0.5">
                Not Found
              </span>
            )}
          </Label>
        </div>
      </div>

      {/* File List Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border rounded-md p-2 mt-2 h-[250px] overflow-auto bg-background relative" // Increased height slightly
        aria-label="File list drag and drop area"
      >
        {files.length > 0 ? (
          renderFiles(filteredFiles) // Render the filtered list
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm italic text-center px-4">
              Drag and drop files or folders here, or use the buttons above.
            </p>
          </div>
        )}
      </div>

      {/* File statistics */}
      {files.length > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          {totalFileCount} file(s) total • {visibleFileCount} showing • {visibleSelectedCount} selected
          {/* More detailed selection count if needed: ({totalSelectedCount} total selected) */}
        </div>
      )}
    </div>
  );
}