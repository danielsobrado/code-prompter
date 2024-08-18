import React, { useState } from 'react';
import Header from './components/Header';
import TaskTypeSelector from './components/TaskTypeSelector';
import CustomInstructionsSelector from './components/CustomInstructionsSelector';
import CodeContext from './components/CodeContext';
import RawPrompt from './components/RawPrompt';
import ActionButtons from './components/ActionButtons';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [taskType, setTaskType] = useState('Feature');
  const [taskTypeChecked, setTaskTypeChecked] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('Default');
  const [customInstructionsChecked, setCustomInstructionsChecked] = useState(true);
  const [rawPrompt, setRawPrompt] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const generatePrompt = () => {
    // This function can be used to update the final prompt in CodeContext if needed
  };

  const handleEdit = () => {
    console.log('Edit button clicked');
  };

  const handleCopy = () => {
    // This function should be updated to copy the content from CodeContext
    console.log('Copy button clicked');
  };

  return (
    <div className="container mx-auto p-4">
      <Header onSettingsClick={handleSettingsClick} />
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="col-span-1">
          <TaskTypeSelector 
            value={taskType} 
            onChange={setTaskType}
            checked={taskTypeChecked}
            onCheckedChange={setTaskTypeChecked}
          />
        </div>
        <div className="col-span-1">
          <CustomInstructionsSelector 
            value={customInstructions} 
            onChange={setCustomInstructions}
            checked={customInstructionsChecked}
            onCheckedChange={setCustomInstructionsChecked}
          />
        </div>
      </div>
      <CodeContext />
      <RawPrompt value={rawPrompt} onChange={setRawPrompt} />
      <ActionButtons 
        onEdit={handleEdit}
        onCopy={handleCopy}
        onGenerate={generatePrompt}
      />
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;