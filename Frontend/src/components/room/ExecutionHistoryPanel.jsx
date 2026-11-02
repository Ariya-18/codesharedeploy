import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  RotateCcw,
  History,
  User,
  Clock,
  Database,
} from "lucide-react";
import toast from "react-hot-toast";

const ExecutionHistoryPanel = ({ executions = [], onRestoreCode, roomId }) => {
  const [expandedId, setExpandedId] = useState(null);
  const [localExecutions, setLocalExecutions] = useState(executions);

  useEffect(() => {
    setLocalExecutions(executions);
  }, [executions]);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatRelativeTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSeconds = Math.floor((now - date) / 1000);

      if (diffSeconds < 60) return "just now";
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? "s" : ""} ago`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return "";
    }
  };

  const getStatusColor = (status) => {
    if (status === "Accepted") return "bg-green-500/10 text-green-400";
    if (status.includes("Error")) return "bg-red-500/10 text-red-400";
    if (status.includes("Limit")) return "bg-amber-500/10 text-amber-400";
    return "bg-gray-500/10 text-gray-400";
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F19]">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#111827] px-3 py-2">
        <History size={14} className="text-primary" />
        <span className="text-xs font-semibold text-white">
          Execution History ({localExecutions.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {localExecutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted">
            <History size={24} className="mb-2 opacity-40" />
            <p className="text-xs">No executions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {localExecutions.map((exec) => {
              const isExpanded = expandedId === exec._id;
              const hasAccepted = exec.status === "Accepted";
              const codePreview = exec.code?.split("\n")[0]?.slice(0, 40) || "No code";
              const codePreviewDisplay =
                codePreview.length > 37 ? codePreview.slice(0, 37) + "..." : codePreview;

              return (
                <div
                  key={exec._id}
                  className="overflow-hidden rounded-lg border border-white/5 bg-[#0B0F19]/40 hover:border-white/10 transition"
                >
                  {/* Header */}
                  <div
                    onClick={() => toggleExpand(exec._id)}
                    className="flex cursor-pointer items-center justify-between gap-3 p-2.5 hover:bg-white/5"
                  >
                    <div className="flex-1">
                      {/* User & Language */}
                      <div className="flex items-center gap-2 mb-1">
                        <User size={11} className="text-muted" />
                        <span className="text-xs font-semibold text-white">
                          {exec.userId?.name || "Unknown"}
                        </span>
                        <span className="text-[10px] font-medium text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                          {exec.language?.toUpperCase()}
                        </span>
                      </div>

                      {/* Code Preview & Time */}
                      <div className="flex items-center gap-2 text-[10px] text-muted">
                        <span className="font-mono text-primary">{codePreviewDisplay}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(exec.createdAt)}</span>
                        {exec.time && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Clock size={8} /> {exec.time}s
                            </span>
                          </>
                        )}
                        {exec.memory && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Database size={8} /> {exec.memory}KB
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Status & Expand Icon */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${getStatusColor(exec.status)}`}
                      >
                        {exec.status}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={12} className="text-muted" />
                      ) : (
                        <ChevronDown size={12} className="text-muted" />
                      )}
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded && (
                    <div className="border-t border-white/5 bg-[#111827] p-2.5 font-mono text-[10px] space-y-2">
                      {exec.stdin && (
                        <div>
                          <div className="text-xs font-semibold text-muted mb-1">stdin</div>
                          <pre className="rounded bg-[#0B0F19] p-1.5 text-white whitespace-pre-wrap overflow-x-auto">
                            {exec.stdin}
                          </pre>
                        </div>
                      )}

                      {exec.stdout && (
                        <div>
                          <div className="text-xs font-semibold text-green-400 mb-1">stdout</div>
                          <pre className="rounded bg-[#0B0F19] p-1.5 text-green-100 whitespace-pre-wrap overflow-x-auto max-h-32">
                            {exec.stdout}
                          </pre>
                        </div>
                      )}

                      {exec.compileOutput && (
                        <div>
                          <div className="text-xs font-semibold text-amber-400 mb-1">compile error</div>
                          <pre className="rounded bg-[#0B0F19] p-1.5 text-amber-100 whitespace-pre-wrap overflow-x-auto max-h-32">
                            {exec.compileOutput}
                          </pre>
                        </div>
                      )}

                      {exec.stderr && (
                        <div>
                          <div className="text-xs font-semibold text-red-400 mb-1">stderr</div>
                          <pre className="rounded bg-[#0B0F19] p-1.5 text-red-100 whitespace-pre-wrap overflow-x-auto max-h-32">
                            {exec.stderr}
                          </pre>
                        </div>
                      )}

                      {/* Code Section */}
                      <div className="border-t border-white/5 pt-2">
                        <div className="text-xs font-semibold text-muted mb-1">code</div>
                        <pre className="rounded bg-[#0B0F19] p-1.5 text-white whitespace-pre-wrap overflow-x-auto max-h-40 text-[9px]">
                          {exec.code}
                        </pre>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 border-t border-white/5 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(exec.code);
                            toast.success("Code copied!");
                          }}
                          className="flex flex-1 items-center justify-center gap-1 rounded bg-purple-600 hover:bg-purple-700 py-1 text-xs font-semibold text-white transition"
                        >
                          <Copy size={10} />
                          Copy
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onRestoreCode(exec.code);
                            toast.success("Code restored!");
                          }}
                          className="flex flex-1 items-center justify-center gap-1 rounded bg-primary hover:bg-primary/90 py-1 text-xs font-semibold text-white transition"
                        >
                          <RotateCcw size={10} />
                          Restore
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionHistoryPanel;
