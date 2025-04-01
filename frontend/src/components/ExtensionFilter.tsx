import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface ExtensionFilterProps {
  extensions: { [key: string]: number };
  onFilterChange: (includedExtensions: string[], excludedExtensions: string[]) => void;
}

export default function ExtensionFilter({ extensions, onFilterChange }: ExtensionFilterProps) {
  const [includedExtensions, setIncludedExtensions] = useState<string[]>([]);
  const [excludedExtensions, setExcludedExtensions] = useState<string[]>([]);
  
  const handleExtensionToggle = (ext: string, action: 'include' | 'exclude') => {
    if (action === 'include') {
      // If extension is already excluded, remove it from excludedExtensions
      if (excludedExtensions.includes(ext)) {
        setExcludedExtensions(excludedExtensions.filter(e => e !== ext));
      }
      
      // Toggle inclusion
      if (includedExtensions.includes(ext)) {
        setIncludedExtensions(includedExtensions.filter(e => e !== ext));
      } else {
        setIncludedExtensions([...includedExtensions, ext]);
      }
    } else {
      // If extension is already included, remove it from includedExtensions
      if (includedExtensions.includes(ext)) {
        setIncludedExtensions(includedExtensions.filter(e => e !== ext));
      }
      
      // Toggle exclusion
      if (excludedExtensions.includes(ext)) {
        setExcludedExtensions(excludedExtensions.filter(e => e !== ext));
      } else {
        setExcludedExtensions([...excludedExtensions, ext]);
      }
    }
  };
  
  // Apply the filters whenever they change
  React.useEffect(() => {
    onFilterChange(includedExtensions, excludedExtensions);
  }, [includedExtensions, excludedExtensions, onFilterChange]);

  const clearFilters = () => {
    setIncludedExtensions([]);
    setExcludedExtensions([]);
  };
  
  const extensionList = Object.keys(extensions).sort();
  const isFiltering = includedExtensions.length > 0 || excludedExtensions.length > 0;

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={isFiltering ? "border-primary" : ""}>
            <Filter className="mr-2 h-4 w-4" />
            Filter Extensions
            {isFiltering && (
              <Badge variant="secondary" className="ml-2">
                {includedExtensions.length + excludedExtensions.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Extension Filters</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {extensionList.length === 0 ? (
            <DropdownMenuItem disabled>No extensions found</DropdownMenuItem>
          ) : (
            <>
              {extensionList.map(ext => (
                <DropdownMenuItem key={ext} className="flex justify-between px-2 py-1.5 cursor-pointer">
                  <span>
                    {ext} <span className="text-muted-foreground">({extensions[ext]})</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant={includedExtensions.includes(ext) ? "default" : "outline"} 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExtensionToggle(ext, 'include');
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant={excludedExtensions.includes(ext) ? "destructive" : "outline"} 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExtensionToggle(ext, 'exclude');
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </DropdownMenuItem>
              ))}
              
              {isFiltering && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={clearFilters}
                    className="justify-center text-center font-medium">
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {isFiltering && (
        <div className="flex flex-wrap gap-1">
          {includedExtensions.map(ext => (
            <Badge key={`include-${ext}`} variant="outline" className="bg-green-50 border-green-200">
              Include: {ext}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleExtensionToggle(ext, 'include')}
              />
            </Badge>
          ))}
          {excludedExtensions.map(ext => (
            <Badge key={`exclude-${ext}`} variant="outline" className="bg-red-50 border-red-200">
              Exclude: {ext}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleExtensionToggle(ext, 'exclude')}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}