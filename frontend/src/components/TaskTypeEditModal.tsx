// TaskTypeEditModal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TaskTypeOption {
  label: string;
  description: string;
}

interface TaskTypeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: TaskTypeOption[];
  onSave: (options: TaskTypeOption[]) => void;
}

export function TaskTypeEditModal({ isOpen, onClose, options, onSave }: TaskTypeEditModalProps) {
  const [localOptions, setLocalOptions] = useState<TaskTypeOption[]>(options);

  const handleAddOption = () => {
    setLocalOptions([...localOptions, { label: '', description: '' }]);
  };

  const handleOptionChange = (index: number, field: 'label' | 'description', value: string) => {
    const updatedOptions = [...localOptions];
    updatedOptions[index] = { ...updatedOptions[index], [field]: value };
    setLocalOptions(updatedOptions);
  };

  const handleDeleteOption = (index: number) => {
    setLocalOptions(localOptions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validOptions = localOptions.filter((option) => option.label.trim() !== '');
    onSave(validOptions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task Types</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {localOptions.map((option, index) => (
            <div key={index} className="space-y-2">
              <Input
                placeholder="Label"
                value={option.label}
                onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
              />
              <Input
                placeholder="Description"
                value={option.description}
                onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
              />
              <Button variant="ghost" size="icon" onClick={() => handleDeleteOption(index)}>
                <span className="text-red-500">×</span>
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={handleAddOption}>
            Add Option
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
