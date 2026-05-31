import { useState, useEffect } from 'react';
import { Play, Code, Copy, Check, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '../utils';

interface ArtifactViewProps {
  code: string;
  language: string;
  id: string;
  key?: string | number;
}

export default function ArtifactView({ code, language, id }: ArtifactViewProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>(
    language === 'html' || language === 'svg' ? 'preview' : 'code'
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHtmlOrSvg = language === 'html' || language === 'svg';

  return (
    <div className="artifact-canvas rounded-xl overflow-hidden border border-slate-200 bg-slate-950 my-4 shadow-sm max-w-full">
      {/* Header */}
      <div className="artifact-header flex justify-between items-center bg-slate-50 px-4 py-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase text-slate-800 tracking-wider font-mono">
            {language} Artifact
          </span>
          {isHtmlOrSvg && (
            <div className="flex bg-slate-200/50 rounded-lg p-0.5 border border-slate-200/60">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  activeTab === 'preview'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="artifact-btn flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 animate-pulse" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative">
        {activeTab === 'code' ? (
          <div className="artifact-code p-4 max-h-[350px] overflow-y-auto overflow-x-auto text-left font-mono text-sm leading-relaxed text-zinc-300">
            <pre className="m-0 select-text outline-none whitespace-pre-wrap word-break-all bg-transparent rounded-none border-none p-0">
              <code className="bg-transparent text-zinc-300">{code}</code>
            </pre>
          </div>
        ) : (
          <div className="bg-white min-h-[320px] max-h-[500px] w-full relative flex flex-col">
            <iframe
              title={`Artifact Preview - ${id}`}
              srcDoc={
                language === 'svg'
                  ? `<div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f7f9fa;">${code}</div>`
                  : code
              }
              sandbox="allow-scripts"
              className="w-full h-[320px] md:h-[400px] border-none bg-white flex-1"
            />
          </div>
        )}
      </div>
    </div>
  );
}
