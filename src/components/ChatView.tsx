import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ChevronDown, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { Message, Conversation, ModelOption, MODELS } from '../types';
import { parseContentParts } from '../utils';
import ArtifactView from './ArtifactView';

interface ChatViewProps {
  conversation: Conversation;
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
  selectedModelId: string;
  onSelectModel: (id: string) => void;
  inputText: string;
  setInputText: (text: string) => void;
}

export default function ChatView({
  conversation,
  isStreaming,
  onSendMessage,
  selectedModelId,
  onSelectModel,
  inputText,
  setInputText
}: ChatViewProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic selector for current model details
  const currentModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isStreaming]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-resize the prompts text area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isStreaming) return;
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = inputText.trim();
      if (text && !isStreaming) {
        onSendMessage(text);
      }
    }
  };

  // Convert pure inline markdown to custom HTML nodes
  const formatMarkdownToHtml = (text: string) => {
    if (!text) return '';
    // Bold
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    // Italic 
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>');
    // Code ticks
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-[#ff6b35] px-1.5 py-0.5 rounded-md font-mono text-[13px] border border-slate-200">$1</code>');
    return html;
  };

  const renderTextContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-2 select-text">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li 
                key={idx} 
                className="list-disc ml-6 text-sm text-slate-700 mb-1"
                dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(trimmed.substring(2)) }}
              />
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const cleanText = trimmed.replace(/^\d+\.\s/, '');
            return (
              <li 
                key={idx} 
                className="list-decimal ml-6 text-sm text-slate-700 mb-1"
                dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(cleanText) }}
              />
            );
          }
          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-2" />;
          }
          return (
            <p 
              key={idx} 
              className="text-sm text-slate-700 leading-relaxed break-words"
              dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(line) }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative" id="chatContainer">
      {/* Scrollable Messages Section */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 space-y-6 bg-slate-50" id="chatMessages">
        {conversation.messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div 
              key={message.id}
              className={`flex gap-3 max-w-full ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar Icon */}
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                  isUser 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-700'
                }`}
              >
                {isUser ? (
                  'H'
                ) : (
                  <Sparkles className="w-4 h-4 text-slate-600" />
                )}
              </div>

              {/* Message Bubble */}
              <div className="max-w-[85%] md:max-w-[75%] flex flex-col space-y-1">
                <div 
                  className={`rounded-2xl px-4 py-3 border shadow-xs ${
                    isUser 
                      ? 'bg-slate-900 text-white border-transparent rounded-tr-xs' 
                      : message.isError 
                        ? 'bg-rose-50 border-rose-200 text-rose-800 rounded-tl-xs' 
                        : 'bg-white border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap select-text">{message.content}</p>
                  ) : (
                    <div className="space-y-4">
                      {parseContentParts(message.content).map((part, index) => {
                        if (part.type === 'artifact') {
                          return (
                            <ArtifactView 
                              key={part.id || index}
                              id={part.id || `${message.id}-${index}`}
                              code={part.content}
                              language={part.language || 'text'}
                            />
                          );
                        }
                        return (
                          <div key={index}>
                            {renderTextContent(part.content)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 self-end select-none px-1">
                  {message.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {/* Streaming Thinking State Indicator */}
        {isStreaming && (
          <div className="flex items-center gap-3" id="typingIndicator">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-pulse duration-1000" />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 px-4 py-2.5 rounded-full shadow-xs">
              <span>Claude is thinking</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Shared Prompt Bar Form */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative cursor-default">
          <div className="bg-slate-50 border border-slate-200 focus-within:border-slate-300 focus-within:bg-white rounded-2xl p-2.5 flex flex-col gap-2 transition-all shadow-xs">
            {/* Multiline textarea entry */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How can I help you today?"
              className="search-input w-full bg-transparent border-none text-slate-800 placeholder-slate-400 font-sans text-sm focus:outline-none focus:ring-0 resize-none px-2 py-1 max-h-[160px] leading-relaxed overflow-y-auto"
              style={{ caretColor: '#1e293b' }}
            />

            {/* Bottom Actions Row */}
            <div className="flex justify-between items-center px-1">
              <div className="relative">
                <button
                  type="button"
                  id="modelSelector"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium select-none shadow-xs"
                >
                  <span id="currentModel">{currentModel.name}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu Container */}
                {isDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsDropdownOpen(false)} 
                    />
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
                      <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 select-none">
                        Select AI Personality
                      </div>
                      <div className="space-y-1">
                        {MODELS.map((opt) => {
                          const isSelected = opt.id === selectedModelId;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                onSelectModel(opt.id);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg transition-colors cursor-pointer select-none ${
                                isSelected 
                                  ? 'bg-slate-100 text-slate-900 font-bold border border-slate-200/50' 
                                  : 'hover:bg-slate-50 text-slate-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">{opt.name}</span>
                                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>}
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{opt.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Submit circle icon */}
              <button
                type="submit"
                id="sendBtn"
                disabled={!inputText.trim() || isStreaming || !selectedModelId}
                className="send-btn-circle w-8 h-8 rounded-lg bg-slate-900 hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 text-white flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Send className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
