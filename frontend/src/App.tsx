// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TaskTypeSelector from './components/TaskTypeSelector';
import CustomInstructionsSelector from './components/CustomInstructionsSelector';
import CodeContext from './components/CodeContext';
import RawPrompt from './components/RawPrompt';
import FinalPrompt from './components/FinalPrompt';
import ActionButtons from './components/ActionButtons';
import { SettingsModal } from './components/SettingsModal';
import {
  ReadTaskTypesFile,
  WriteTaskTypesFile,
  ReadCustomInstructionsFile,
  WriteCustomInstructionsFile,
} from '../wailsjs/go/main/App';
import { TaskTypeEditModal } from './components/TaskTypeEditModal';
import { CustomInstructionsEditModal } from './components/CustomInstructionsEditModal';

interface TaskTypeOption {
  id: number;
  label: string;
  description: string;
}

interface CustomInstructionOption {
  id: number;
  label: string;
  description: string;
}

function App() {
  const [taskType, setTaskType] = useState<number | null>(null);
  const [taskTypeChecked, setTaskTypeChecked] = useState(true);
  const [customInstruction, setCustomInstruction] = useState<number | null>(null);
  const [customInstructionsChecked, setCustomInstructionsChecked] = useState(true);
  const [rawPrompt, setRawPrompt] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [selectedFilesContent, setSelectedFilesContent] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskTypeEditOpen, setIsTaskTypeEditOpen] = useState(false);
  const [isCustomInstructionsEditOpen, setIsCustomInstructionsEditOpen] = useState(false);
  const [taskTypeOptions, setTaskTypeOptions] = useState<TaskTypeOption[]>([]);
  const [customInstructionsOptions, setCustomInstructionsOptions] = useState<CustomInstructionOption[]>([]);
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const taskTypesContent = await ReadTaskTypesFile();
        const taskTypes: TaskTypeOption[] = JSON.parse(taskTypesContent);
        const defaultTaskTypes = taskTypes.length
          ? taskTypes
          : [
              { id: 1, label: 'Feature', description: 'Implement a new feature.' },
              { id: 2, label: 'Bug', description: 'Fix a bug or issue.' },
              { id: 3, label: 'Refactor', description: 'Refactor existing code.' },
            ];
        setTaskTypeOptions(defaultTaskTypes);
        setTaskType(defaultTaskTypes[0].id);

        const customInstructionsContent = await ReadCustomInstructionsFile();
        const customInstructions: CustomInstructionOption[] = JSON.parse(
          customInstructionsContent
        );
        const defaultCustomInstructions = customInstructions.length
          ? customInstructions
          : [
              { id: 1, label: 'Default', description: 'Use default instructions.' },
              { id: 2, label: 'Detailed', description: 'Provide detailed explanations.' },
              { id: 3, label: 'Minimal', description: 'Keep explanations brief.' },
            ];
        setCustomInstructionsOptions(defaultCustomInstructions);
        setCustomInstruction(defaultCustomInstructions[0].id);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };
    loadOptions();
  }, []);

  const handleSaveTaskTypes = async (options: TaskTypeOption[]) => {
    try {
      await WriteTaskTypesFile(JSON.stringify(options, null, 2));
      setTaskTypeOptions(options);
      if (options.length > 0 && !options.find((opt) => opt.id === taskType)) {
        setTaskType(options[0].id);
      }
    } catch (error) {
      console.error('Error saving task types:', error);
    }
  };

  const handleSaveCustomInstructions = async (
    options: CustomInstructionOption[]
  ) => {
    try {
      await WriteCustomInstructionsFile(JSON.stringify(options, null, 2));
      setCustomInstructionsOptions(options);
      if (options.length > 0 && !options.find((opt) => opt.id === customInstruction)) {
        setCustomInstruction(options[0].id);
      }
    } catch (error) {
      console.error('Error saving custom instructions:', error);
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const calculateTokenCount = (text: string): number => {
    // Approximate token count; for more accurate results, integrate a tokenizer
    return text.trim().split(/\s+/).length;
  };

  const generatePrompt = useCallback(() => {
    let prompt = '';

    if (taskTypeChecked && taskType !== null) {
      const taskTypeOption = taskTypeOptions.find((opt) => opt.id === taskType);
      if (taskTypeOption) {
        prompt += `Task Type: ${taskTypeOption.label}\n`;
        prompt += `${taskTypeOption.description}\n\n`;
      }
    }

    if (customInstructionsChecked && customInstruction !== null) {
      const customInstructionOption = customInstructionsOptions.find(
        (opt) => opt.id === customInstruction
      );
      if (customInstructionOption) {
        prompt += `Custom Instructions: ${customInstructionOption.label}\n`;
        prompt += `${customInstructionOption.description}\n\n`;
      }
    }

    if (rawPrompt) {
      prompt += `Raw Prompt: ${rawPrompt}\n\n`;
    }

    if (selectedFilesContent) {
      prompt += `Selected Files:\n${selectedFilesContent}\n\n`;
    }

    setFinalPrompt(prompt);
    setTokenCount(calculateTokenCount(prompt));
  }, [
    taskType,
    taskTypeChecked,
    customInstruction,
    customInstructionsChecked,
    rawPrompt,
    selectedFilesContent,
    taskTypeOptions,
    customInstructionsOptions,
  ]);

  useEffect(() => {
    generatePrompt();
  }, [generatePrompt]);

  const handleEdit = () => {
    // Implement edit functionality
    console.log('Edit button clicked');
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(finalPrompt)
      .then(() => console.log('Prompt copied to clipboard'))
      .catch((err) => console.error('Failed to copy prompt: ', err));
  };

  const handleSelectedFilesChange = useCallback((content: string) => {
    setSelectedFilesContent(content);
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Header onSettingsClick={handleSettingsClick} />
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <TaskTypeSelector
            value={taskType}
            onChange={setTaskType}
            checked={taskTypeChecked}
            onCheckedChange={setTaskTypeChecked}
            onEditClick={() => setIsTaskTypeEditOpen(true)}
            options={taskTypeOptions}
          />
        </div>
        <div className="col-span-1">
          <CustomInstructionsSelector
            value={customInstruction}
            onChange={setCustomInstruction}
            checked={customInstructionsChecked}
            onCheckedChange={setCustomInstructionsChecked}
            onEditClick={() => setIsCustomInstructionsEditOpen(true)}
            options={customInstructionsOptions}
          />
        </div>
      </div>
      <CodeContext onSelectedFilesChange={handleSelectedFilesChange} />
      <RawPrompt value={rawPrompt} onChange={setRawPrompt} />
      <FinalPrompt value={finalPrompt} tokenCount={tokenCount} />
      <ActionButtons onEdit={handleEdit} onCopy={handleCopy} onGenerate={generatePrompt} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      <TaskTypeEditModal
        isOpen={isTaskTypeEditOpen}
        onClose={() => setIsTaskTypeEditOpen(false)}
        options={taskTypeOptions}
        onSave={handleSaveTaskTypes}
      />
      <CustomInstructionsEditModal
        isOpen={isCustomInstructionsEditOpen}
        onClose={() => setIsCustomInstructionsEditOpen(false)}
        options={customInstructionsOptions}
        onSave={handleSaveCustomInstructions}
      />
    </div>
  );
}

export default App;
