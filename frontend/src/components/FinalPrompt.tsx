import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FinalPromptProps {
  value: string;
  tokenCount: number;
}

export default function FinalPrompt({ value, tokenCount }: FinalPromptProps) {
  return (
    <div className="mt-4 flex">
      {/* ... existing code */}
      <div className="w-3/4">
        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg">Final Prompt</CardTitle>
            <span className="text-sm text-gray-500">Tokens: {tokenCount}</span>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>Task Type</li>
              <li>Custom Instructions</li>
              <li>Raw Prompt</li>
              <li>Selected Files</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <div className="w-3/4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Final Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              {value ? (
                <pre className="whitespace-pre-wrap">{value}</pre>
              ) : (
                <p className="text-gray-500 italic">The final prompt will appear here.</p>
              )}
            </ScrollArea>       
          </CardContent>
        </Card>
      </div>
    </div>
  );
}