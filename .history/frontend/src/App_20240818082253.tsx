import React, { useState } from 'react';
import Header from './components/Header';
import TaskTypeSelector from './components/TaskTypeSelector';
import CustomInstructionsSelector from './components/CustomInstructionsSelector';
import CodeContext from './components/CodeContext';
import RawPrompt from './components/RawPrompt';
import FinalPrompt from './components/FinalPrompt';
import ActionButtons from './components/ActionButtons';
import { SettingsModal } from './components/SettingsModal';

function App() {
  const [taskType, setTaskType] = useState('Feature');
  const [taskTypeChecked, setTaskTypeChecked] = useState(true);
  const [customInstructions, setCustomInstructions] = useState('Default');
  const [customInstructionsChecked, setCustomInstructionsChecked] = useState(true);
  const [rawPrompt, setRawPrompt] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [selectedFilesContent, setSelectedFilesContent] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const generatePrompt = () => {
    let prompt = '';
    
    if (taskTypeChecked) {
      prompt += `Task Type: ${taskType}\n\n`;
    }
    
    if (customInstructionsChecked) {
      prompt += `Custom Instructions: ${customInstructions}\n\n`;
    }
    
    prompt += `Raw Prompt: ${rawPrompt}\n\n`;
    prompt += `Selected Files:\n${selectedFilesContent}\n\n`;
    
    setFinalPrompt(prompt);
  };

  const handleEdit = () => {
    // Implement edit functionality
    console.log('Edit button clicked');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(finalPrompt)
      .then(() => console.log('Prompt copied to clipboard'))
      .catch(err => console.error('Failed to copy prompt: ', err));
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
      <CodeContext onSelectedFilesChange={setSelectedFilesContent} />
      <RawPrompt value={rawPrompt} onChange={setRawPrompt} />
      <FinalPrompt value={finalPrompt} />
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