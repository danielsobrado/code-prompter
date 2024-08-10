import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface TaskTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TaskTypeSelector({ value, onChange }: TaskTypeSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="task-type" className="whitespace-nowrap">Task Type</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="task-type" className="w-full">
          <SelectValue placeholder="Select task type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Feature">Feature</SelectItem>
          <SelectItem value="Bug">Bug</SelectItem>
          <SelectItem value="Refactor">Refactor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}