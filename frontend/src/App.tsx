// App.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import TaskTypeSelector from './components/TaskTypeSelector';
import CustomInstructionsSelector from './components/CustomInstructionsSelector';
import CodeContext, { SelectedFile } from './components/CodeContext';
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
  const [taskType, setTaskType] = useState<string>('');
  const [taskTypeChecked, setTaskTypeChecked] = useState<boolean>(true);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [customInstructionsChecked, setCustomInstructionsChecked] = useState<boolean>(true);
  const [rawPrompt, setRawPrompt] = useState<string>('');
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [selectedFilesArray, setSelectedFilesArray] = useState<SelectedFile[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTaskTypeEditOpen, setIsTaskTypeEditOpen] = useState<boolean>(false);
  const [isCustomInstructionsEditOpen, setIsCustomInstructionsEditOpen] = useState<boolean>(false);
  const [taskTypeOptions, setTaskTypeOptions] = useState<TaskTypeOption[]>([]);
  const [customInstructionsOptions, setCustomInstructionsOptions] = useState<CustomInstructionOption[]>([]);
  const [tokenCount, setTokenCount] = useState<number>(0);

  // State to track the current prompt type ('ChatGPT' or 'Claude')
  const [currentPromptType, setCurrentPromptType] = useState<'ChatGPT' | 'Claude'>('ChatGPT');

  // Ref to track the previous prompt type
  const prevPromptType = useRef<'ChatGPT' | 'Claude'>('ChatGPT');

  // Default task instructions
  const DEFAULT_CHATGPT_INSTRUCTION =
    'You are an expert coder tasked with the above task and need to strictly follow the instructions. Use the files provided as existing reference and code base.';

  const DEFAULT_CLAUDE_INSTRUCTION =
    'You are an expert coder tasked with the above <TASK> and need to strictly follow the <INSTRUCTIONS>. Use the files in <FILES> as existing reference and code base.';

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
            { id: uuidv4(), label: 'Implement Feature', description: 'Implement a new feature.' },
            { id: uuidv4(), label: 'Fix Bug', description: 'Fix a bug or issue.' },
            { id: uuidv4(), label: 'Refactor Code', description: 'Refactor existing code.' },
          ];
        }

        setTaskTypeOptions(taskTypes);
        setTaskType(taskTypes[0].label); // Set default value

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
        setCustomInstructions(customInstructions[0].label); // Set default value
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
      // Update selected task type if it was deleted
      if (!options.some((opt) => opt.label === taskType)) {
        setTaskType(options.length > 0 ? options[0].label : '');
      }
    } catch (error) {
      console.error('Error saving task types:', error);
    }
  };

  const handleSaveCustomInstructions = async (options: CustomInstructionOption[]) => {
    try {
      await WriteCustomInstructionsFile(JSON.stringify(options, null, 2));
      setCustomInstructionsOptions(options);
      // Update selected custom instruction if it was deleted
      if (!options.some((opt) => opt.label === customInstructions)) {
        setCustomInstructions(options.length > 0 ? options[0].label : '');
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

    // Add Task Description
    if (taskTypeChecked && taskType) {
      const taskTypeDescription = getTaskTypeDescription(taskType);
      prompt += `Task:\n${taskTypeDescription}\n\n`;
    }

    // Add Instructions
    if (customInstructionsChecked && customInstructions) {
      const customInstructionDescription = getCustomInstructionDescription(customInstructions);
      prompt += `Instructions:\n${customInstructionDescription}\n\n`;
    }

    // Add Selected Files
    if (selectedFilesArray.length > 0) {
      const filesText = selectedFilesArray
        .map((file) => `File: ${file.path}\n${file.content}`)
        .join('\n\n');
      prompt += `Files:\n${filesText}\n\n`;
    }

    // Append Raw Prompt (Task Instruction)
    prompt += rawPrompt;

    setFinalPrompt(prompt);
    setTokenCount(calculateTokenCount(prompt));
  }, [
    taskType,
    taskTypeChecked,
    customInstructions,
    customInstructionsChecked,
    rawPrompt,
    selectedFilesArray,
    taskTypeOptions,
    customInstructionsOptions,
  ]);

  // Generate prompt for Claude
  const generateClaudePrompt = useCallback(() => {
    let prompt = '';

    // Start with FILES section
    if (selectedFilesArray.length > 0) {
      const filesXml = selectedFilesArray
        .map((file) => {
          return `  <FILE>\n    <FILEPATH>${file.path}</FILEPATH>\n    <FILECONTENT><![CDATA[${file.content}]]></FILECONTENT>\n  </FILE>`;
        })
        .join('\n');
      prompt += `<FILES>\n${filesXml}\n</FILES>\n\n`;
    }

    // Add TASK section
    if (taskTypeChecked && taskType) {
      const taskTypeDescription = getTaskTypeDescription(taskType);
      prompt += `<TASK>\n${taskTypeDescription}\n</TASK>\n\n`;
    }

    // Add INSTRUCTIONS section
    if (customInstructionsChecked && customInstructions) {
      const customInstructionDescription = getCustomInstructionDescription(customInstructions);
      prompt += `<INSTRUCTIONS>\n${customInstructionDescription}\n</INSTRUCTIONS>\n\n`;
    }

    // Append Raw Prompt (Task Instruction)
    prompt += rawPrompt;

    setFinalPrompt(prompt);
    setTokenCount(calculateTokenCount(prompt));
  }, [
    taskType,
    taskTypeChecked,
    customInstructions,
    customInstructionsChecked,
    rawPrompt,
    selectedFilesArray,
    taskTypeOptions,
    customInstructionsOptions,
  ]);

  // useEffect to handle prompt generation and default task instruction
  useEffect(() => {
    // Update task instruction if it matches the default of the previous prompt type
    const prevDefaultInstruction =
      prevPromptType.current === 'ChatGPT'
        ? DEFAULT_CHATGPT_INSTRUCTION
        : DEFAULT_CLAUDE_INSTRUCTION;

    const currentDefaultInstruction =
      currentPromptType === 'ChatGPT'
        ? DEFAULT_CHATGPT_INSTRUCTION
        : DEFAULT_CLAUDE_INSTRUCTION;

    if (rawPrompt.trim() === '' || rawPrompt === prevDefaultInstruction) {
      setRawPrompt(currentDefaultInstruction);
    }

    // Generate the prompt based on the current prompt type
    if (currentPromptType === 'ChatGPT') {
      generateChatGPTPrompt();
    } else if (currentPromptType === 'Claude') {
      generateClaudePrompt();
    }

    // Update the previous prompt type
    prevPromptType.current = currentPromptType;
  }, [
    currentPromptType,
    taskType,
    taskTypeChecked,
    customInstructions,
    customInstructionsChecked,
    rawPrompt,
    selectedFilesArray,
    taskTypeOptions,
    customInstructionsOptions,
    generateChatGPTPrompt,
    generateClaudePrompt,
  ]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(finalPrompt)
      .then(() => console.log('Prompt copied to clipboard'))
      .catch((err) => console.error('Failed to copy prompt: ', err));
  };

  const handleSelectedFilesChange = useCallback((files: SelectedFile[]) => {
    setSelectedFilesArray(files);
  }, []);

  // Handle Generate ChatGPT button click
  const handleGenerateChatGPT = () => {
    setCurrentPromptType('ChatGPT');
  };

  // Handle Generate Claude button click
  const handleGenerateClaude = () => {
    setCurrentPromptType('Claude');
  };

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
        onGenerateChatGPT={handleGenerateChatGPT}
        onGenerateClaude={handleGenerateClaude}
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
