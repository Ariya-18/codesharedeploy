import { useState, useEffect } from "react";
import { Bell, Trash2, Check, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import EmptyState from "../components/common/EmptyState";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // "all" or "unread"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Seed with sample notifications if fetch fails
      seedSampleNotifications();
    } finally {
      setLoading(false);
    }
  };

  const seedSampleNotifications = () => {
    const samples = [
      {
        _id: "1",
        type: "room_created",
        title: "Room Created",
        message: "You created a new practice room",
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        relatedRoomId: "ABC123",
      },
      {
        _id: "2",
        type: "user_joined",
        title: "User Joined",
        message: "Ariya Prakash joined your room",
        isRead: false,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        relatedRoomId: "ABC123",
      },
      {
        _id: "3",
        type: "invited",
        title: "Invited to Room",
        message: "You were invited to join an interview session",
        isRead: true,
        createdAt: new Date(Date.now() - 60 * 60000).toISOString(),
        relatedRoomId: "XYZ789",
      },
      {
        _id: "4",
        type: "review",
        title: "Review Received",
        message: "Your code has been reviewed by a mentor",
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
        relatedRoomId: "ABC123",
      },
      {
        _id: "5",
        type: "scheduled",
        title: "Interview Reminder",
        message: "Your scheduled interview starts in 30 minutes",
        isRead: true,
        createdAt: new Date(Date.now() - 48 * 60 * 60000).toISOString(),
        relatedRoomId: "INTER001",
      },
    ];
    setNotifications(samples);
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${import.meta.env.VITE_API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      room_created: "🏠",
      user_joined: "👋",
      invited: "📨",
      review: "✅",
      scheduled: "📅",
      message: "💬",
    };
    return icons[type] || "🔔";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filtered =
    filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="border-b border-white/10 bg-[#111827] px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-primary" />
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
            </div>
            {notifications.some((n) => !n.isRead) && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium transition"
              >
                <CheckCheck size={14} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "all"
                  ? "bg-primary text-white"
                  : "bg-white/5 text-muted hover:bg-white/10"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === "unread"
                  ? "bg-primary text-white"
                  : "bg-white/5 text-muted hover:bg-white/10"
              }`}
            >
              Unread ({notifications.filter((n) => !n.isRead).length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
              description={
                filter === "unread"
                  ? "You're all caught up!"
                  : "We'll notify you when things happen"
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition ${
                    notif.isRead
                      ? "border-white/5 bg-[#111827]/30"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  {/* Icon */}
                  <div className="text-2xl flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-white">{notif.title}</h3>
                      <span className="text-xs text-muted whitespace-nowrap">
                        {formatTime(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted">{notif.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="p-2 rounded-lg text-muted hover:bg-white/10 hover:text-white transition"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif._id)}
                      className="p-2 rounded-lg text-muted hover:bg-red-500/10 hover:text-red-400 transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Unread Dot */}
                  {!notif.isRead && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
