// CustomInstructionsEditModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CustomInstructionOption {
  id: number;
  label: string;
  description: string;
}

interface CustomInstructionsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  options: CustomInstructionOption[];
  onSave: (options: CustomInstructionOption[]) => void;
}

export function CustomInstructionsEditModal({
  isOpen,
  onClose,
  options,
  onSave,
}: CustomInstructionsEditModalProps) {
  const [localOptions, setLocalOptions] = useState<CustomInstructionOption[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  useEffect(() => {
    if (selectedOptionId !== null) {
      const selectedOption = localOptions.find(
        (option) => option.id === selectedOptionId
      );
      if (selectedOption) {
        setLabel(selectedOption.label);
        setDescription(selectedOption.description);
        setIsNew(false);
      }
    } else {
      setLabel('');
      setDescription('');
    }
  }, [selectedOptionId, localOptions]);

  const handleSelectChange = (value: string) => {
    setSelectedOptionId(parseInt(value));
  };

  const handleCreateNew = () => {
    setSelectedOptionId(null);
    setLabel('');
    setDescription('');
    setIsNew(true);
  };

  const handleSave = () => {
    if (label.trim() === '') {
      alert('Label is required.');
      return;
    }

    let updatedOptions = [...localOptions];
    if (isNew) {
      const newId =
        localOptions.length > 0
          ? Math.max(...localOptions.map((o) => o.id)) + 1
          : 1;
      updatedOptions.push({ id: newId, label, description });
    } else if (selectedOptionId !== null) {
      updatedOptions = updatedOptions.map((option) =>
        option.id === selectedOptionId
          ? { ...option, label, description }
          : option
      );
    }
    setLocalOptions(updatedOptions);
    onSave(updatedOptions);
    onClose();
  };

  const handleDelete = () => {
    if (selectedOptionId !== null) {
      const confirmed = window.confirm(
        'Are you sure you want to delete this Custom Instruction?'
      );
      if (confirmed) {
        const updatedOptions = localOptions.filter(
          (option) => option.id !== selectedOptionId
        );
        setLocalOptions(updatedOptions);
        setSelectedOptionId(null);
        setLabel('');
        setDescription('');
        onSave(updatedOptions);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Custom Instructions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Label className="whitespace-nowrap">Select Instruction:</Label>
            <Select
              value={selectedOptionId !== null ? selectedOptionId.toString() : ''}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Custom Instruction" />
              </SelectTrigger>
              <SelectContent>
                {localOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleCreateNew}>
              Create New
            </Button>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="Label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          {selectedOptionId !== null && !isNew && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isNew ? 'Create' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
