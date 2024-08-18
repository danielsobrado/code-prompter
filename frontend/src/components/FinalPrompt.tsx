import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FinalPromptProps {
  value: string;
}

export default function FinalPrompt({ value }: FinalPromptProps) {
  return (
    <div className="mt-4 flex">
      <div className="w-1/4 pr-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sections</CardTitle>
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