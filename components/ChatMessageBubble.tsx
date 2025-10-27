import React, { useState } from 'react';
import { type ChatMessage } from '../types';
import { BotIcon, LinkIcon, CopyIcon, CheckIcon } from './Icons';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isBot = message.sender === 'bot';

  const bubbleClasses = isBot
    ? 'bg-gray-700 text-gray-200 rounded-r-lg rounded-bl-lg'
    : 'bg-blue-600 text-white rounded-l-lg rounded-br-lg';

  const wrapperClasses = isBot ? 'justify-start' : 'justify-end';

  const handleCopy = () => {
    if (navigator.clipboard && message.text) {
      navigator.clipboard.writeText(message.text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  return (
    <div className={`group flex items-end gap-2 ${wrapperClasses}`}>
      {isBot && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <BotIcon className="w-5 h-5 text-gray-300" />
        </div>
      )}
      <div className="flex flex-col max-w-xs md:max-w-md lg:max-w-2xl">
        <div className={`p-4 ${bubbleClasses}`}>
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 text-xs text-gray-400">
            <h4 className="font-semibold mb-1">Sources:</h4>
            <ul className="space-y-1">
              {message.sources.map((source, index) => (
                <li key={index}>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                  >
                    <LinkIcon className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{source.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
       {isBot && message.text && (
        <button
          onClick={handleCopy}
          className="self-center p-1.5 rounded-full text-gray-400 hover:bg-gray-700 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label={isCopied ? "Copied" : "Copy message"}
        >
          {isCopied ? (
            <CheckIcon className="w-5 h-5 text-green-400" />
          ) : (
            <CopyIcon className="w-5 h-5" />
          )}
        </button>
      )}
    </div>
  );
};

export default ChatMessageBubble;
