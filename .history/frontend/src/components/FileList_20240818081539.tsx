// import React from 'react';
// import FileItem from './FileItem';
// import { FileItem as FileItemType } from './CodeContext';

// interface FileListProps {
//   files: FileItemType[];
//   onFileToggle: (path: string) => void;
//   onFileRemove: (path: string) => void;
// }

// const FileList: React.FC<FileListProps> = ({ files, onFileToggle, onFileRemove }) => {
//   if (files.length === 0) {
//     return (
//       <p className="text-gray-500 text-center mt-4">
//         Drag and drop files or folders here, or use the buttons below to add them.
//       </p>
//     );
//   }

//   return (
//     <ul className="space-y-2">
//       {files.map((file) => (
//         <FileItem
//           key={file.path}
//           file={file}
//           onToggle={() => onFileToggle(file.path)}
//           onRemove={() => onFileRemove(file.path)}
//         />
//       ))}
//     </ul>
//   );
// };

// export default FileList;