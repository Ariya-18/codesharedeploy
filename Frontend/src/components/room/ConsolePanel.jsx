import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Terminal,
  Trash2,
  Clock,
  Database,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const ConsolePanel = ({ output, running, input, onInputChange, onClearHistory }) => {
  const consoleRef = useRef(null);

  // Auto-scroll console to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    if (status.includes("Accepted")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          <CheckCircle size={12} />
          Accepted
        </span>
      );
    }
    if (status.includes("Error")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          <AlertCircle size={12} />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
        <AlertCircle size={12} />
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19]">
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-3 py-2">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-primary" />
          <span className="text-xs font-semibold text-white">Output</span>
          {output && (
            <div className="flex items-center gap-3 ml-4">
              {getStatusBadge(output.status)}
              {output.time && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock size={11} />
                  {output.time}s
                </span>
              )}
              {output.memory && (
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Database size={11} />
                  {output.memory} KB
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={onClearHistory}
          className="p-1 hover:bg-white/5 rounded transition text-muted hover:text-white"
          title="Clear console"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Console Output */}
      <div
        ref={consoleRef}
        className="flex-1 overflow-y-auto font-mono text-xs p-3 space-y-2 bg-[#0B0F19]"
      >
        {running && (
          <div className="flex items-center gap-2 text-cyan-400">
            <Loader2 size={14} className="animate-spin" />
            <span>Running...</span>
          </div>
        )}

        {!running && !output && (
          <div className="text-muted text-center py-8">
            Click "Run" or press Ctrl+Enter to execute code
          </div>
        )}

        {!running && output && (
          <>
            {/* stdout */}
            {output.stdout && (
              <div>
                <div className="text-green-400 font-semibold mb-1">stdout:</div>
                <pre className="text-green-100 whitespace-pre-wrap break-words">
                  {output.stdout}
                </pre>
              </div>
            )}

            {/* compileOutput */}
            {output.compileOutput && (
              <div>
                <div className="text-amber-400 font-semibold mb-1">compile error:</div>
                <pre className="text-amber-100 whitespace-pre-wrap break-words">
                  {output.compileOutput}
                </pre>
              </div>
            )}

            {/* stderr */}
            {output.stderr && (
              <div>
                <div className="text-red-400 font-semibold mb-1">stderr:</div>
                <pre className="text-red-100 whitespace-pre-wrap break-words">
                  {output.stderr}
                </pre>
              </div>
            )}

            {!output.stdout && !output.stderr && !output.compileOutput && (
              <div className="text-muted">[No output]</div>
            )}
          </>
        )}
      </div>

      {/* Input Tab */}
      <div className="border-t border-white/10 bg-[#111827] p-3">
        <label className="block text-xs font-semibold text-muted mb-2">
          stdin (Input)
        </label>
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter input here (optional)"
          rows={3}
          className="w-full resize-none rounded border border-white/10 bg-[#0B0F19] px-2 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-primary"
        />
      </div>
    </div>
  );
};

export default ConsolePanel;
