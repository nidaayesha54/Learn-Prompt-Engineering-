import React, { useState, useRef, useEffect } from 'react';
import { type ChatMessage, type Coordinates } from './types';
import ChatMessageBubble from './components/ChatMessageBubble';
import ExamplePrompts from './components/ExamplePrompts';
import TypingIndicator from './components/TypingIndicator';
import { getGeminiResponse } from './services/geminiService';
import { SendIcon, LocationIcon, SettingsIcon, ArrowDownIcon } from './components/Icons';
import SystemPromptModal from './components/SystemPromptModal';

const SYSTEM_PROMPT_KEY = 'gemini-system-prompt';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSystemPromptModalOpen, setIsSystemPromptModalOpen] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const savedPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);
    if (savedPrompt) {
      setSystemPrompt(savedPrompt);
    }
  }, []);
  
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show the button if the user has scrolled up more than 300px from the bottom
      const isScrolledUp = scrollHeight - scrollTop > clientHeight + 300;
      setShowScrollToBottom(isScrolledUp);
    }
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          let errorMessage = "An unknown error occurred.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = "You denied the request for Geolocation.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = "Location information is unavailable.";
          } else if (error.code === error.TIMEOUT) {
            errorMessage = "The request to get user location timed out.";
          }
          setLocationError(errorMessage);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  const handleSaveSystemPrompt = (prompt: string) => {
    setSystemPrompt(prompt);
    localStorage.setItem(SYSTEM_PROMPT_KEY, prompt);
  };

  const sendMessage = async (prompt: string) => {
    if (!prompt.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      text: prompt,
      sender: 'user',
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, sources } = await getGeminiResponse(prompt, messages, location, systemPrompt);
      const newBotMessage: ChatMessage = {
        id: Date.now() + 1,
        text,
        sender: 'bot',
        sources,
      };
      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error(error);
      const errorBotMessage: ChatMessage = {
        id: Date.now() + 1,
        text: "Oops! Something went wrong. Please try again.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
    sendMessage(prompt);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <header className="relative flex items-center justify-center p-4 border-b border-gray-700 shadow-md">
        <h1 className="text-2xl font-bold text-gray-200">Learn Prompt Engineering</h1>
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => setIsSystemPromptModalOpen(true)}
              className={`p-1.5 rounded-full transition-colors duration-200 ${systemPrompt ? 'text-blue-400 hover:bg-blue-900' : 'text-gray-400 hover:bg-gray-700'}`}
              aria-label="Set system prompt"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      <main ref={chatContainerRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && !isLoading ? (
             <ExamplePrompts onPromptClick={handlePromptClick} />
          ) : (
            messages.map((msg) => <ChatMessageBubble key={msg.id} message={msg} />)
          )}
          
          {isLoading && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>
        
        {showScrollToBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 right-4 md:right-8 z-10 p-2 bg-blue-600 rounded-full text-white shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-opacity duration-300"
              aria-label="Scroll to bottom"
            >
              <ArrowDownIcon className="w-6 h-6" />
            </button>
        )}
      </main>

      <footer className="p-4 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          {locationError && <p className="text-red-400 text-sm text-center mb-2">{locationError}</p>}
          <div className="flex items-center bg-gray-800 rounded-lg p-2 border border-gray-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all duration-200">
            <button
              onClick={handleLocation}
              className={`p-2 rounded-full transition-colors duration-200 ${location ? 'text-blue-400 hover:bg-blue-900' : 'text-gray-400 hover:bg-gray-700'}`}
              aria-label="Use current location"
            >
              <LocationIcon className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Gemini anything..."
              className="flex-1 bg-transparent px-4 py-2 text-gray-200 placeholder-gray-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 rounded-full bg-blue-600 text-white disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-label="Send message"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </footer>
      
      <SystemPromptModal
        isOpen={isSystemPromptModalOpen}
        onClose={() => setIsSystemPromptModalOpen(false)}
        onSave={handleSaveSystemPrompt}
        currentPrompt={systemPrompt}
      />
    </div>
  );
};

export default App;