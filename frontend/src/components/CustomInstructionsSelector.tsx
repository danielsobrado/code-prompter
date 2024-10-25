// CustomInstructionsSelector.tsx
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

interface CustomInstructionOption {
  id: number;
  label: string;
  description: string;
}

interface CustomInstructionsSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onEditClick: () => void;
  options: CustomInstructionOption[];
}

export default function CustomInstructionsSelector({
  value,
  onChange,
  checked,
  onCheckedChange,
  onEditClick,
  options,
}: CustomInstructionsSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="custom-instructions-checkbox"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="custom-instructions" className="whitespace-nowrap">
        Custom Instructions
      </Label>
      <Select
        value={value !== null ? value.toString() : ''}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger id="custom-instructions" className="w-full">
          <SelectValue placeholder="Select Custom Instruction" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id.toString()}>
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
