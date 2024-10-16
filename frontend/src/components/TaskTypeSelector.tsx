// TaskTypesSelector.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface TaskTypeOption {
  label: string;
  description: string;
}

interface TaskTypesSelectorProps {
  value: string;
  onChange: (value: string) => void;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onEditClick: () => void;
  options: TaskTypeOption[];
}

export default function TaskTypesSelector({
  value,
  onChange,
  checked,
  onCheckedChange,
  onEditClick,
  options,
}: TaskTypesSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="task-type-checkbox"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="task-type" className="whitespace-nowrap">
        Task Types
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="task-type" className="w-full">
          <SelectValue placeholder="Select Task Types" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.label} value={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={onEditClick}>
        <Edit className="h-4 w-4" />
      </Button>
    </div>
  );
}
