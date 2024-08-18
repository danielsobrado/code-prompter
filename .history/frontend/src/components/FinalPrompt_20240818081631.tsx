import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FinalPromptProps {
  value: string;
}

export default function FinalPrompt({ value }: FinalPromptProps) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Final Prompt</CardTitle>
      </CardHeader>
      <CardContent>
        {value ? (
          <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
            {value}
          </pre>
        ) : (
          <p className="text-gray-500 italic">The final prompt will appear here.</p>
        )}
      </CardContent>
    </Card>
  )
}