import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { Play, Pause, ArrowLeft, FastForward, Rewind } from "lucide-react";
import toast from "react-hot-toast";
import { getRecording } from "../../services/recordingService";

const SessionReplay = () => {
  const { recordingId } = useParams();
  const navigate = useNavigate();
  const [recording, setRecording] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const requestRef = useRef();
  const lastUpdateRef = useRef();

  useEffect(() => {
    getRecording(recordingId)
      .then((res) => {
        setRecording(res.data);
      })
      .catch(() => {
        toast.error("Recording not found");
        navigate("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [recordingId, navigate]);

  const duration = recording?.duration || 0;

  // Compute current code state based on currentTime
  const { code, language } = useMemo(() => {
    if (!recording) return { code: "", language: "javascript" };
    
    let currentCode = recording.initialCode || "";
    let currentLang = recording.initialLanguage || "javascript";
    
    for (const event of recording.events) {
      if (event.timestamp > currentTime) break;
      if (event.type === "code-change") {
        currentCode = event.code;
      } else if (event.type === "language-change") {
        currentLang = event.language;
      }
    }
    
    return { code: currentCode, language: currentLang };
  }, [recording, currentTime]);

  const animate = (time) => {
    if (lastUpdateRef.current !== undefined) {
      const deltaTime = time - lastUpdateRef.current;
      setCurrentTime((prevTime) => {
        const nextTime = prevTime + deltaTime * playbackSpeed;
        if (nextTime >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return nextTime;
      });
    }
    lastUpdateRef.current = time;
    if (isPlayingRef.current) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (isPlaying) {
      if (currentTime >= duration) {
        setCurrentTime(0); // restart if at end
      }
      lastUpdateRef.current = performance.now();
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, playbackSpeed, duration]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setCurrentTime(Math.max(0, Math.min(percent * duration, duration)));
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!recording) return null;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 bg-[#111827] px-5 py-3">
        <button onClick={() => navigate(-1)} className="rounded p-1 text-muted hover:bg-white/5 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-white">{recording.title}</h1>
          <p className="text-xs text-muted">Session Replay • {formatTime(duration)}</p>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: "on",
            scrollBeyondLastLine: false,
            padding: { top: 16 },
          }}
        />
      </div>

      {/* Timeline Controls */}
      <div className="border-t border-white/10 bg-[#111827] p-4">
        {/* Timeline bar */}
        <div 
          className="relative h-2 w-full cursor-pointer rounded-full bg-white/10 mb-4"
          onClick={handleSeek}
        >
          <div 
            className="absolute left-0 top-0 h-full rounded-full bg-primary"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white hover:bg-primary/90 transition"
            >
              {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
            </button>
            <div className="text-sm font-mono text-muted">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {[0.5, 1, 1.5, 2, 4].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  playbackSpeed === speed ? "bg-white/20 text-white" : "text-muted hover:bg-white/10"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionReplay;
