// TaskTypeEditModal.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TaskTypeOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface TaskTypeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: TaskTypeOption[];
  onSave: (options: TaskTypeOption[]) => void;
}

export function TaskTypeEditModal({
  isOpen,
  onClose,
  options,
  onSave,
}: TaskTypeEditModalProps) {
  const [localOptions, setLocalOptions] = useState<TaskTypeOption[]>(options);

  const handleAddOption = () => {
    const newOption: TaskTypeOption = {
      id: uuidv4(),
      label: '',
      description: '',
    };
    setLocalOptions([...localOptions, newOption]);
  };

  const handleOptionChange = (id: string, field: keyof TaskTypeOption, value: string) => {
    setLocalOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === id ? { ...option, [field]: value } : option
      )
    );
  };

  const handleDeleteOption = (id: string) => {
    setLocalOptions((prevOptions) => prevOptions.filter((option) => option.id !== id));
  };

  const handleSave = () => {
    onSave(localOptions);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task Types</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {localOptions.map((option) => (
            <div key={option.id} className="space-y-2 border-b pb-4">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Label"
                  value={option.label}
                  onChange={(e) =>
                    handleOptionChange(option.id, 'label', e.target.value)
                  }
                />
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteOption(option.id)}
                >
                  Delete
                </Button>
              </div>
              <Textarea
                placeholder="Description"
                value={option.description}
                onChange={(e) =>
                  handleOptionChange(option.id, 'description', e.target.value)
                }
              />
            </div>
          ))}
          <Button onClick={handleAddOption}>Add Task Type</Button>
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
