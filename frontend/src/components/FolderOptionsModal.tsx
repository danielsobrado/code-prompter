import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface FolderOptionsModalProps {
  onConfirm: (options: any) => void;
  onCancel: () => void;
  recursive: boolean;
  includeInPrompt: boolean;
  onRecursiveChange: (checked: boolean) => void;
  onIncludeChange: (checked: boolean) => void;
}

export default function FolderOptionsModal({
  onConfirm,
  onCancel,
  recursive,
  includeInPrompt,
  onRecursiveChange,
  onIncludeChange,
}: FolderOptionsModalProps) {
  const [ignoreFileSuffixes, setIgnoreFileSuffixes] = React.useState('.env,.log,.json,.gitignore,.npmrc,.prettierrc');
  const [ignoreFolders, setIgnoreFolders] = React.useState('.git,.vscode,.idea,node_modules,venv,build,dist,coverage,out,next');

  const handleConfirm = () => {
    onConfirm({
      recursive,
      includeInPrompt,
      ignoreFileSuffixes: ignoreFileSuffixes.split(','),
      ignoreFolders: ignoreFolders.split(',')
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-lg font-bold mb-4">Add Folder</h2>
        <div className="mb-4">
          <Label htmlFor="recursive-checkbox">Add files recursively in sub-folders?</Label>
          <Checkbox id="recursive-checkbox" checked={recursive} onCheckedChange={onRecursiveChange} />
        </div>
        <div className="mb-4">
          <Label htmlFor="include-checkbox">Include newly added files in the final prompt automatically?</Label>
          <Checkbox id="include-checkbox" checked={includeInPrompt} onCheckedChange={onIncludeChange} />
        </div>
        <div className="mb-4">
          <Label htmlFor="ignore-file-suffixes">Ignore file suffixes (comma-separated):</Label>
          <input
            id="ignore-file-suffixes"
            className="border p-2 w-full"
            value={ignoreFileSuffixes}
            onChange={(e) => setIgnoreFileSuffixes(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="ignore-folders">Ignore folders (comma-separated):</Label>
          <input
            id="ignore-folders"
            className="border p-2 w-full"
            value={ignoreFolders}
            onChange={(e) => setIgnoreFolders(e.target.value)}
          />
        </div>
        <div className="text-xs text-blue-500 mb-4">
          Images and files larger than 500KB are automatically ignored.
        </div>
        <div className="flex justify-end">
          <Button variant="default" className="mr-2" onClick={handleConfirm}>Confirm</Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
