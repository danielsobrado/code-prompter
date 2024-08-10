import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface CustomInstructionsSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CustomInstructionsSelector({ value, onChange }: CustomInstructionsSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
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