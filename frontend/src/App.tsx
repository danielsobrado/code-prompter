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
import TaskTypeEditModal from './components/TaskTypeEditModal';
import CustomInstructionsEditModal from './components/CustomInstructionsEditModal';
import { TaskTypeOption, CustomInstructionOption } from './types';
import { v4 as uuidv4 } from 'uuid';
import { CheckedState } from '@radix-ui/react-checkbox';

function App() {
  const [taskType, setTaskType] = useState<string>('Feature');
  const [taskTypeChecked, setTaskTypeChecked] = useState<boolean>(true);
  const [customInstructions, setCustomInstructions] = useState<string>('Default');
  const [customInstructionsChecked, setCustomInstructionsChecked] = useState<boolean>(true);
  const [rawPrompt, setRawPrompt] = useState<string>('');
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [selectedFilesContent, setSelectedFilesContent] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTaskTypeEditOpen, setIsTaskTypeEditOpen] = useState<boolean>(false);
  const [isCustomInstructionsEditOpen, setIsCustomInstructionsEditOpen] = useState<boolean>(false);
  const [taskTypeOptions, setTaskTypeOptions] = useState<TaskTypeOption[]>([]);
  const [customInstructionsOptions, setCustomInstructionsOptions] = useState<CustomInstructionOption[]>([]);
  const [tokenCount, setTokenCount] = useState<number>(0);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const taskTypesContent = await ReadTaskTypesFile();
        let taskTypes: TaskTypeOption[] = JSON.parse(taskTypesContent);

        // Ensure 'id' is present
        taskTypes = taskTypes.map((option) => ({
          id: option.id || uuidv4(),
          label: option.label,
          description: option.description,
        }));

        if (taskTypes.length === 0) {
          taskTypes = [
            { id: uuidv4(), label: 'Feature', description: 'Implement a new feature.' },
            { id: uuidv4(), label: 'Bug', description: 'Fix a bug or issue.' },
            { id: uuidv4(), label: 'Refactor', description: 'Refactor existing code.' },
          ];
        }

        setTaskTypeOptions(taskTypes);

        const customInstructionsContent = await ReadCustomInstructionsFile();
        let customInstructions: CustomInstructionOption[] = JSON.parse(customInstructionsContent);

        // Ensure 'id' is present
        customInstructions = customInstructions.map((option) => ({
          id: option.id || uuidv4(),
          label: option.label,
          description: option.description,
        }));

        if (customInstructions.length === 0) {
          customInstructions = [
            { id: uuidv4(), label: 'Default', description: 'Use default instructions.' },
            { id: uuidv4(), label: 'Detailed', description: 'Provide detailed explanations.' },
            { id: uuidv4(), label: 'Minimal', description: 'Keep explanations brief.' },
          ];
        }

        setCustomInstructionsOptions(customInstructions);
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
    } catch (error) {
      console.error('Error saving task types:', error);
    }
  };

  const handleSaveCustomInstructions = async (options: CustomInstructionOption[]) => {
    try {
      await WriteCustomInstructionsFile(JSON.stringify(options, null, 2));
      setCustomInstructionsOptions(options);
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

  const getTaskTypeDescription = (label: string): string => {
    const option = taskTypeOptions.find((opt) => opt.label === label);
    return option ? option.description : '';
  };

  const getCustomInstructionDescription = (label: string): string => {
    const option = customInstructionsOptions.find((opt) => opt.label === label);
    return option ? option.description : '';
  };

  // Generate prompt for ChatGPT
  const generateChatGPTPrompt = useCallback(() => {
    let prompt = '';

    if (taskTypeChecked && taskType) {
      const taskTypeDescription = getTaskTypeDescription(taskType);
      prompt += `Task Type: ${taskType}\n`;
      prompt += `${taskTypeDescription}\n\n`;
    }

    if (customInstructionsChecked && customInstructions) {
      const customInstructionDescription = getCustomInstructionDescription(customInstructions);
      prompt += `Custom Instructions: ${customInstructions}\n`;
      prompt += `${customInstructionDescription}\n\n`;
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
    customInstructions,
    customInstructionsChecked,
    rawPrompt,
    selectedFilesContent,
    taskTypeOptions,
    customInstructionsOptions,
  ]);

  // Generate prompt for Claude
  const generateClaudePrompt = useCallback(() => {
    let prompt = '';

    prompt += `<Task>\n`;

    if (taskTypeChecked && taskType) {
      const taskTypeDescription = getTaskTypeDescription(taskType);
      prompt += `  <Type>\n    <Label>${taskType}</Label>\n    <Description>${taskTypeDescription}</Description>\n  </Type>\n`;
    }

    if (customInstructionsChecked && customInstructions) {
      const customInstructionDescription = getCustomInstructionDescription(customInstructions);
      prompt += `  <CustomInstructions>\n    <Label>${customInstructions}</Label>\n    <Description>${customInstructionDescription}</Description>\n  </CustomInstructions>\n`;
    }

    if (rawPrompt) {
      prompt += `  <RawPrompt>${rawPrompt}</RawPrompt>\n`;
    }

    if (selectedFilesContent) {
      // Convert selectedFilesContent to XML format
      const filesXml = selectedFilesContent
        .split('\n\n')
        .map((fileBlock) => {
          const [fileLine, ...contentLines] = fileBlock.split('\n');
          const pathMatch = fileLine.match(/^File: (.+)$/);
          if (pathMatch) {
            const filePath = pathMatch[1];
            const content = contentLines.join('\n');
            return `    <File>\n      <Path>${filePath}</Path>\n      <Content><![CDATA[${content}]]></Content>\n    </File>`;
          }
          return '';
        })
        .join('\n');

      prompt += `  <SelectedFiles>\n${filesXml}\n  </SelectedFiles>\n`;
    }

    prompt += `</Task>`;

    setFinalPrompt(prompt);
    setTokenCount(calculateTokenCount(prompt));
  }, [
    taskType,
    taskTypeChecked,
    customInstructions,
    customInstructionsChecked,
    rawPrompt,
    selectedFilesContent,
    taskTypeOptions,
    customInstructionsOptions,
  ]);

  // Generate ChatGPT prompt by default on state changes
  useEffect(() => {
    generateChatGPTPrompt();
  }, [generateChatGPTPrompt]);

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
            onCheckedChange={(checked: CheckedState) => setTaskTypeChecked(!!checked)}
            onEditClick={() => setIsTaskTypeEditOpen(true)}
            options={taskTypeOptions}
          />
        </div>
        <div className="col-span-1">
          <CustomInstructionsSelector
            value={customInstructions}
            onChange={setCustomInstructions}
            checked={customInstructionsChecked}
            onCheckedChange={(checked: CheckedState) => setCustomInstructionsChecked(!!checked)}
            onEditClick={() => setIsCustomInstructionsEditOpen(true)}
            options={customInstructionsOptions}
          />
        </div>
      </div>
      <CodeContext onSelectedFilesChange={handleSelectedFilesChange} />
      <RawPrompt value={rawPrompt} onChange={setRawPrompt} />
      <FinalPrompt
        value={finalPrompt}
        tokenCount={tokenCount}
        onChange={(value) => {
          setFinalPrompt(value);
          setTokenCount(calculateTokenCount(value));
        }}
      />
      <ActionButtons
        onCopy={handleCopy}
        onGenerateChatGPT={generateChatGPTPrompt}
        onGenerateClaude={generateClaudePrompt}
      />
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
