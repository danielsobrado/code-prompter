// import React from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { FileItem } from './CodeContext';

// interface FinalPromptProps {
//   files: FileItem[];
// }

// const FinalPrompt: React.FC<FinalPromptProps> = ({ files }) => {
//   const promptContent = files.map(file => `File: ${file.path}\n${file.content}\n\n`).join('');

//   return (
//     <Card className="mt-4">
//       <CardHeader>
//         <CardTitle className="text-lg">Final Prompt</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="h-60 overflow-y-auto">
//           {promptContent ? (
//             <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded">
//               {promptContent}
//             </pre>
//           ) : (
//             <p className="text-gray-500 italic">The final prompt will appear here.</p>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default FinalPrompt;