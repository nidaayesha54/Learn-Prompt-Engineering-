
import React from 'react';

interface ExamplePromptsProps {
  onPromptClick: (prompt: string) => void;
}

const prompts = [
  "What is prompt engineering?",
  "Find good coffee shops near me.",
  "Explain the chain-of-thought prompting technique.",
  "What are some common mistakes to avoid when writing prompts?",
];

const ExamplePrompts: React.FC<ExamplePromptsProps> = ({ onPromptClick }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-400 mb-4 text-center">Or try one of these examples:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {prompts.map((prompt) => (
                <button
                    key={prompt}
                    onClick={() => onPromptClick(prompt)}
                    className="p-4 bg-gray-800 border border-gray-700 rounded-lg text-left text-gray-300 hover:bg-gray-700 hover:border-blue-500 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {prompt}
                </button>
            ))}
        </div>
    </div>
  );
};

export default ExamplePrompts;