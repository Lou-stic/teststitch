import { motion } from 'motion/react';
import { 
  Sun, 
  PenTool, 
  BookOpen, 
  Code, 
  Calendar,
  CheckCircle,
  Sparkles,
  Play
} from 'lucide-react';

interface WelcomeViewProps {
  isPuterConnected: boolean;
  onConnectPuter: () => void;
  onSelectSuggestion: (prompt: string) => void;
  isConnecting: boolean;
}

export default function WelcomeView({
  isPuterConnected,
  onConnectPuter,
  onSelectSuggestion,
  isConnecting
}: WelcomeViewProps) {
  const suggestions = [
    {
      title: "Help me write",
      prompt: "Help me write a creative story about space",
      icon: <PenTool className="w-5 h-5 text-slate-700" />
    },
    {
      title: "Explain a topic",
      prompt: "Explain quantum physics like I'm five",
      icon: <BookOpen className="w-5 h-5 text-slate-700" />
    },
    {
      title: "Fix my code",
      prompt: "Analyze this code for bugs: \n```javascript\nfunction selectItem(items) {\n  for (var i = 0; i < items.length; i++) {\n    setTimeout(function() {\n      console.log('Selected item: ' + items[i]);\n    }, 1000);\n  }\n}\n```",
      icon: <Code className="w-5 h-5 text-slate-700" />
    },
    {
      title: "Plan my week",
      prompt: "Create a 7-day meal plan for weight loss",
      icon: <Calendar className="w-5 h-5 text-slate-700" />
    }
  ];

  return (
    <div 
      className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full space-y-8 select-none"
      id="welcomeScreen"
    >
      {/* Sun Header Greet */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
        className="flex flex-col items-center gap-4 mt-8 md:mt-12"
      >
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-slate-900/5 blur-xl rounded-full scale-120"
          />
          <Sun className="w-14 h-14 text-slate-800 relative z-10 fill-amber-100/10 animate-pulse duration-[3000ms]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-800 font-sans mt-2">
          Good morning, Hassan
        </h1>
      </motion.div>

      {/* Puter Auth Box / Connection Status */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        {!isPuterConnected ? (
          <div 
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-300 hover:shadow-md"
            id="authBox"
          >
            <p className="text-sm font-medium text-slate-500">
              Authenticate with Puter to enable Claude AI
            </p>
            <button 
              onClick={onConnectPuter}
              disabled={isConnecting}
              className="mt-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white py-2.5 px-6 rounded-xl font-semibold text-sm w-full transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              id="authButton"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting Securely...</span>
                </>
              ) : (
                <>
                  <span>Connect Puter</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200/60 rounded-2xl p-4 flex items-center justify-center gap-3 text-sm text-emerald-700 font-medium shadow-xs">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Puter Connected • Claude Live API Active</span>
          </div>
        )}
      </motion.div>

      {/* Suggestions Cards Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full"
      >
        {suggestions.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onSelectSuggestion(item.prompt)}
            className="action-card bg-white hover:bg-slate-50 border border-slate-200/80 p-5 rounded-2xl text-left cursor-pointer transition-all flex flex-col gap-4 group hover:border-slate-300 shadow-xs select-none"
          >
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl w-fit group-hover:bg-slate-100 transition-colors">
              {item.icon}
            </div>
            <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
              {item.title}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
