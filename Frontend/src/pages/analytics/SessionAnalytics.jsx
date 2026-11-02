import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, Activity, Code2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getSessionAnalytics, generateAnalytics } from "../../services/analyticsService";
import { getRecording } from "../../services/recordingService";

const SessionAnalytics = () => {
  const { recordingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recording
        const recordingRes = await getRecording(recordingId);
        setRecording(recordingRes.data);

        // Fetch or generate analytics
        try {
          const analyticsRes = await getSessionAnalytics(recordingId);
          setAnalytics(analyticsRes.data);
        } catch {
          // Generate if not found
          const genRes = await generateAnalytics(recordingId);
          setAnalytics(genRes.data);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load analytics");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [recordingId, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!analytics || !recording) return null;

  // Prepare chart data
  const timeData = [
    { name: "Active", value: Math.round(analytics.activeTime / 1000) },
    { name: "Idle", value: Math.round(analytics.idleTime / 1000) },
  ];

  const executionData = [
    { name: "Successful", value: analytics.successfulExecutions, fill: "#22C55E" },
    { name: "Failed", value: analytics.failedExecutions, fill: "#EF4444" },
  ];

  const COLORS = ["#6366F1", "#8B5CF6", "#06B6D4", "#22C55E", "#F59E0B"];

  const StatCard = ({ icon: Icon, label, value, unit = "" }) => (
    <div className="rounded-lg border border-white/10 bg-[#111827] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {typeof value === "number" ? value.toLocaleString() : value}
            <span className="text-sm text-muted ml-1">{unit}</span>
          </p>
        </div>
        <Icon size={24} className="text-primary" />
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/10 bg-[#111827] px-5 py-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded p-1 text-muted hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-white">
            {recording.title}
          </h1>
          <p className="text-xs text-muted">Analytics Dashboard</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Activity}
              label="Total Session Time"
              value={Math.round(analytics.totalSessionTime / 1000 / 60)}
              unit="min"
            />
            <StatCard
              icon={Code2}
              label="Total Characters"
              value={analytics.totalCharactersAdded}
            />
            <StatCard
              icon={BarChart3}
              label="Executions"
              value={analytics.totalExecutions}
            />
            <StatCard
              icon={MessageSquare}
              label="Messages"
              value={analytics.messagesCount}
            />
          </div>

          {/* Typing & Execution Metrics */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-[#111827] p-4">
              <h3 className="mb-4 font-semibold text-white text-sm">
                Typing Speed
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted">Average</span>
                  <span className="text-sm font-semibold text-white">
                    {analytics.averageTypingSpeed} CPM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted">Peak</span>
                  <span className="text-sm font-semibold text-primary">
                    {analytics.peakTypingSpeed} CPM
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-[#111827] p-4">
              <h3 className="mb-4 font-semibold text-white text-sm">
                Execution Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-muted">Success Rate</span>
                  <span className="text-sm font-semibold text-green-400">
                    {analytics.totalExecutions > 0
                      ? Math.round(
                          (analytics.successfulExecutions /
                            analytics.totalExecutions) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted">Avg Time</span>
                  <span className="text-sm font-semibold text-white">
                    {analytics.averageExecutionTime}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Time Distribution */}
            <div className="rounded-lg border border-white/10 bg-[#111827] p-4">
              <h3 className="mb-4 font-semibold text-white text-sm">
                Time Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={timeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#6366F1" />
                    <Cell fill="#8B5CF6" />
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Execution Results */}
            <div className="rounded-lg border border-white/10 bg-[#111827] p-4">
              <h3 className="mb-4 font-semibold text-white text-sm">
                Execution Results
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={executionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {executionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Languages Used */}
          {analytics.languagesUsed.length > 0 && (
            <div className="rounded-lg border border-white/10 bg-[#111827] p-4">
              <h3 className="mb-4 font-semibold text-white text-sm">
                Languages Used
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {analytics.languagesUsed.map((lang, idx) => (
                  <div
                    key={lang.language}
                    className="rounded bg-white/5 p-3 text-center"
                  >
                    <p className="text-xs text-muted mb-1">{lang.language}</p>
                    <p className="text-lg font-semibold text-white">
                      {lang.count}x
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionAnalytics;
