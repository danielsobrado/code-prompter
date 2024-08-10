import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CodeContext() {
  const [files, setFiles] = useState<File[]>([])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    setFiles(prevFiles => [...prevFiles, ...droppedFiles])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="mt-4">
      <Card>
        <CardContent 
          className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg" 
          onDrop={handleDrop} 
          onDragOver={handleDragOver}
        >
          {files.length > 0 ? (
            <ul>
              {files.map(file => <li key={file.name}>{file.name}</li>)}
            </ul>
          ) : (
            <p className="text-gray-500">Drag and drop files or folders here</p>
          )}
        </CardContent>
      </Card>
      <Button className="mt-2" variant="outline">Add File Manually</Button>
    </div>
  )
}