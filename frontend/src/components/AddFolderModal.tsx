import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (config: FolderConfig) => void;
}

interface FolderConfig {
  recursive: boolean;
  includeNewFiles: boolean;
  ignoreSuffixes: string;
  ignoreFolders: string;
}

export function AddFolderModal({ isOpen, onClose, onConfirm }: AddFolderModalProps) {
  const [config, setConfig] = useState<FolderConfig>({
    recursive: false,
    includeNewFiles: false,
    ignoreSuffixes: '.env,.log,.json,.gitignore,.npmrc,.prettierrc',
    ignoreFolders: '.git/.vscode/.idea/node_modules/.env/.build/.dist/.coverage/.out/.next/',
  });

  const handleConfirm = () => {
    onConfirm(config);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p>Add files recursively in sub-folders?</p>
            <RadioGroup
              value={config.recursive ? "recursive" : "non-recursive"}
              onValueChange={(value) => setConfig({...config, recursive: value === "recursive"})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recursive" id="recursive" />
                <Label htmlFor="recursive">Recursive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="non-recursive" id="non-recursive" />
                <Label htmlFor="non-recursive">Non-recursive</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <p>Include newly added files in the final prompt automatically?</p>
            <RadioGroup
              value={config.includeNewFiles ? "include" : "exclude"}
              onValueChange={(value) => setConfig({...config, includeNewFiles: value === "include"})}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="include" id="include" />
                <Label htmlFor="include">Include</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exclude" id="exclude" />
                <Label htmlFor="exclude">Exclude</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="ignore-suffixes">Ignore file suffixes (comma-separated):</Label>
            <Input
              id="ignore-suffixes"
              value={config.ignoreSuffixes}
              onChange={(e) => setConfig({...config, ignoreSuffixes: e.target.value})}
            />
          </div>
          <div>
            <Label htmlFor="ignore-folders">Ignore folders (comma-separated):</Label>
            <Input
              id="ignore-folders"
              value={config.ignoreFolders}
              onChange={(e) => setConfig({...config, ignoreFolders: e.target.value})}
            />
          </div>
          <p className="text-sm text-blue-500">Images and files larger than 500KB are automatically ignored.</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}