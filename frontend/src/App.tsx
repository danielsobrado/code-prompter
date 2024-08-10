import { useState } from 'react'
import Header from './components/Header'
import TaskTypeSelector from './components/TaskTypeSelector'
import CustomInstructionsSelector from './components/CustomInstructionsSelector'
import CodeContext from './components/CodeContext'
import RawPrompt from './components/RawPrompt'
import FinalPrompt from './components/FinalPrompt'
import ActionButtons from './components/ActionButtons'

function App() {
  const [taskType, setTaskType] = useState('Feature')
  const [taskTypeChecked, setTaskTypeChecked] = useState(true)
  const [customInstructions, setCustomInstructions] = useState('Default')
  const [customInstructionsChecked, setCustomInstructionsChecked] = useState(true)
  const [rawPrompt, setRawPrompt] = useState('')
  const [finalPrompt] = useState('')

  return (
    <div className="container mx-auto p-4">
      <Header />
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
      <FinalPrompt value={finalPrompt} />
      <ActionButtons />
    </div>
  )
}

export default App