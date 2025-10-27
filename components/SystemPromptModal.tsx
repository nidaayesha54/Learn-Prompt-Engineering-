import React, { useState, useEffect } from 'react';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: string) => void;
  currentPrompt: string;
}

const exampleSystemPrompts = [
  "You are a helpful assistant that speaks like a pirate.",
  "Respond in short, concise sentences.",
  "Translate every response into French.",
  "You are a code expert. Provide detailed explanations and code examples in Python.",
];

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({ isOpen, onClose, onSave, currentPrompt }) => {
  const [prompt, setPrompt] = useState(currentPrompt);

  useEffect(() => {
    setPrompt(currentPrompt);
  }, [currentPrompt, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(prompt);
    onClose();
  };

  const handleClear = () => {
    setPrompt('');
  };
  
  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-700 m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">Set System Prompt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Define custom instructions for Gemini to follow for every response.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., You are a helpful assistant that speaks like a pirate."
          className="w-full h-40 p-3 bg-gray-900 text-gray-200 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          aria-label="System prompt input"
        />

        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Try an example:</h3>
          <div className="flex flex-wrap gap-2">
            {exampleSystemPrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="px-3 py-1 bg-gray-700 text-xs text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end items-center mt-6 space-x-3">
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptModal;