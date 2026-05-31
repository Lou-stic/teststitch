import { useState, useEffect } from 'react';
import { Menu, PlusCircle, Sparkles, Laptop, Shield } from 'lucide-react';
import Sidebar from './components/Sidebar';
import WelcomeView from './components/WelcomeView';
import ChatView from './components/ChatView';
import { Conversation, Message } from './types';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>('claude-3-5-sonnet');
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPuterConnected, setIsPuterConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load chats from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('claude_mobile_chats');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setCurrentChatId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load local chats', e);
    }
  }, []);

  // Save chats to localStorage on changes
  const saveChats = (updated: Conversation[]) => {
    setConversations(updated);
    try {
      localStorage.setItem('claude_mobile_chats', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save chats', e);
    }
  };

  const handleNewChat = () => {
    const newChat: Conversation = {
      id: `chat-${Date.now()}`,
      title: 'New Session',
      messages: [],
      modelId: selectedModelId,
      timestamp: Date.now()
    };
    const updated = [newChat, ...conversations];
    saveChats(updated);
    setCurrentChatId(newChat.id);
    setInputText('');
  };

  const handleDeleteChat = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    saveChats(updated);
    if (currentChatId === id) {
      setCurrentChatId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSelectChat = (id: string) => {
    setCurrentChatId(id);
    const chat = conversations.find(c => c.id === id);
    if (chat) {
      setSelectedModelId(chat.modelId);
    }
  };

  const handleConnectPuter = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsPuterConnected(true);
      setIsConnecting(false);
    }, 1400); // Super polished micro interaction latency simulating secure OAuth exchange
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    let activeChatId = currentChatId;
    let updatedConversations = [...conversations];

    // Create a conversation if none exists or we are in welcome screen starting fresh
    let currentChat = conversations.find(c => c.id === activeChatId);
    const isNewSession = !currentChat || currentChat.messages.length === 0;

    if (isNewSession) {
      const title = content.length > 32 ? content.substring(0, 32) + '...' : content;
      if (!currentChat) {
        currentChat = {
          id: `chat-${Date.now()}`,
          title: title,
          messages: [],
          modelId: selectedModelId,
          timestamp: Date.now()
        };
        updatedConversations = [currentChat, ...updatedConversations];
        activeChatId = currentChat.id;
      } else {
        currentChat.title = title;
      }
    }

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = `msg-assistant-${Date.now()}`;
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    currentChat.messages = [...currentChat.messages, userMsg, assistantMsg];
    currentChat.modelId = selectedModelId;
    currentChat.timestamp = Date.now();

    // Re-order conversations to put active first
    const withoutActive = updatedConversations.filter(c => c.id !== activeChatId);
    const reordered = [currentChat, ...withoutActive];
    
    saveChats(reordered);
    setCurrentChatId(activeChatId);
    setInputText('');
    setIsStreaming(true);

    try {
      // Build client payload
      // Send chat history to back-end streaming generator
      const cleanHistory = currentChat.messages
        .slice(0, -1) // Excluding the empty assistant stamp we just generated
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: cleanHistory,
          modelId: selectedModelId
        })
      });

      if (!response.ok) {
        throw new Error('Server returned an error status');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No stream available');

      let fullResponseText = '';
      let isCompleted = false;

      while (!isCompleted) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              isCompleted = true;
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                fullResponseText += parsed.text;
                
                // Update conversation chunk in state and saving
                const liveChats = localStorage.getItem('claude_mobile_chats');
                let parsedChats: Conversation[] = liveChats ? JSON.parse(liveChats) : reordered;
                const target = parsedChats.find(c => c.id === activeChatId);
                if (target) {
                  const targetMsg = target.messages.find(m => m.id === assistantMsgId);
                  if (targetMsg) {
                    targetMsg.content = fullResponseText;
                  }
                  // Save dynamically
                  setConversations(parsedChats);
                }
              }
            } catch (e) {
              // Ignore partial parsing failures
            }
          }
        }
      }

      // Final commit to storage
      const finalChats = localStorage.getItem('claude_mobile_chats');
      if (finalChats) {
        saveChats(JSON.parse(finalChats));
      }

    } catch (err: any) {
      console.error('Streaming fail:', err);
      // Inject standard clean error message inside bubble
      const liveChats = localStorage.getItem('claude_mobile_chats');
      let parsedChats: Conversation[] = liveChats ? JSON.parse(liveChats) : reordered;
      const target = parsedChats.find(c => c.id === activeChatId);
      if (target) {
        const targetMsg = target.messages.find(m => m.id === assistantMsgId);
        if (targetMsg) {
          targetMsg.content = `I was unable to retrieve a response from Claude. Technical details: ${err.message || 'Check your internet connection or server API key status.'}`;
          targetMsg.isError = true;
        }
        saveChats(parsedChats);
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSelectSuggestion = (prompt: string) => {
    setInputText(prompt);
  };

  const currentChat = conversations.find(c => c.id === currentChatId);
  const showChatFeed = currentChat && currentChat.messages.length > 0;

  return (
    <div className="flex w-full h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Panel Navigation component */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main workspace arena */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden bg-slate-50 min-w-0">
        
        {/* Sleek Custom Minimalism Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-xs">
          <div className="flex items-center space-x-3.5">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="w-5.5 h-5.5" />
            </button>
            <div className="flex items-center space-x-3">
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Active Task</h2>
              <span className="px-2 py-0.5 bg-neutral-900 text-white text-[9px] font-bold uppercase rounded-sm border border-neutral-900 tracking-wider">
                Claude Autonomous Scout
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleNewChat}
              className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              title="Start a new session"
            >
              <PlusCircle className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>

        {/* Dynamic center element feed */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {showChatFeed ? (
            <ChatView 
              conversation={currentChat!}
              isStreaming={isStreaming}
              onSendMessage={handleSendMessage}
              selectedModelId={selectedModelId}
              onSelectModel={setSelectedModelId}
              inputText={inputText}
              setInputText={setInputText}
            />
          ) : (
            <div className="flex-1 overflow-y-auto">
              <WelcomeView 
                isPuterConnected={isPuterConnected}
                onConnectPuter={handleConnectPuter}
                onSelectSuggestion={handleSelectSuggestion}
                isConnecting={isConnecting}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
