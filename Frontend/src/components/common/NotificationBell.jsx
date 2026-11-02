import { useState, useEffect, useRef } from "react";
import { Bell, X } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data?.slice(0, 5) || []); // Show latest 5
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type) => {
    const icons = {
      room_created: "🏠",
      user_joined: "👋",
      invited: "📨",
      review: "✅",
      scheduled: "📅",
    };
    return icons[type] || "🔔";
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now - date) / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-white/10 bg-[#111827] shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="border-b border-white/10 p-4 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`p-3 cursor-pointer transition ${
                      notif.isRead
                        ? "hover:bg-white/5"
                        : "bg-primary/5 hover:bg-primary/10"
                    }`}
                  >
                    <div className="flex gap-2 items-start">
                      <span className="text-lg flex-shrink-0">
                        {getIcon(notif.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white line-clamp-1">
                          {notif.title}
                        </p>
                        <p className="text-xs text-muted line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-muted mt-1">
                          {formatTime(notif.createdAt)}
                        </span>
                      </div>
                      {!notif.isRead && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-3">
            <Link
              to="/notifications"
              className="block w-full text-center py-2 text-xs font-medium text-primary hover:bg-white/5 rounded transition"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
