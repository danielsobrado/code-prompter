import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

interface CustomInstructionsSelectorProps {
  value: string;
  onChange: (value: string) => void;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export default function CustomInstructionsSelector({ value, onChange, checked, onCheckedChange }: CustomInstructionsSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="custom-instructions-checkbox"
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor="custom-instructions" className="whitespace-nowrap">Custom Instructions</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="custom-instructions" className="w-full">
          <SelectValue placeholder="Select custom instructions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Default">Default</SelectItem>
          <SelectItem value="Detailed">Detailed</SelectItem>
          <SelectItem value="Minimal">Minimal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}