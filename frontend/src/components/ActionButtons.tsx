import { Button } from "@/components/ui/button"
import { Edit, Copy, Wand2 } from "lucide-react"

interface ActionButtonsProps {
  onEdit?: () => void;
  onCopy?: () => void;
  onGenerate?: () => void;
}

export default function ActionButtons({ onEdit, onCopy, onGenerate }: ActionButtonsProps) {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      <Button variant="outline" size="sm" onClick={onEdit}>
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
      <Button variant="outline" size="sm" onClick={onCopy}>
        <Copy className="w-4 h-4 mr-2" />
        Copy
      </Button>
      <Button variant="default" size="sm" onClick={onGenerate}>
        <Wand2 className="w-4 h-4 mr-2" />
        Generate Prompt
      </Button>
    </div>
  )
}