import { motion } from 'motion/react';
import { 
  X, 
  Plus, 
  MessageSquare, 
  Sparkles, 
  History, 
  Layers, 
  Trash2, 
  Globe
} from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat
}: SidebarProps) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          id="sidebarOverlay"
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        id="sidebar"
        className={`fixed md:relative top-0 bottom-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-900 font-semibold text-lg tracking-tight">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-full"></div>
              </div>
              <span>Claude</span>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              id="closeSidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer shadow-xs"
            id="newChatBtn"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>New chat</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-3 py-3 border-b border-slate-100 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200/60 text-sm font-medium rounded-lg cursor-pointer">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Chats</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium rounded-lg cursor-pointer transition-colors">
            <Layers className="w-4 h-4" />
            <span>Artifacts</span>
            <span className="ml-auto text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm font-mono">Beta</span>
          </div>
        </div>

        {/* Recent Conversations Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase flex items-center gap-1.5 px-2">
            <History className="w-3.5 h-3.5" />
            <span>Recent Session</span>
          </div>

          <div className="space-y-1" id="recentItems">
            {conversations.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                No history yet
              </div>
            ) : (
              conversations.map((chat) => {
                const isActive = chat.id === currentChatId;
                return (
                  <div 
                    key={chat.id}
                    className={`group relative flex items-center justify-between rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-slate-50 border border-slate-200 text-slate-900 font-medium' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <button
                      onClick={() => {
                        onSelectChat(chat.id);
                        onClose();
                      }}
                      className="flex-1 text-left px-3 py-2 text-sm truncate"
                    >
                      {chat.title}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded transition-opacity duration-150 cursor-pointer mr-2"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center space-x-3 px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl cursor-pointer transition-colors shadow-sm">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
              H
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate leading-tight">Hassan</h4>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
