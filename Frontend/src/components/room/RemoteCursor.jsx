import { motion, AnimatePresence } from "framer-motion";

const RemoteCursor = ({ cursors = {} }) => {
  return (
    <AnimatePresence>
      {Object.entries(cursors).map(([userId, { user, position }]) => {
        if (!position) return null;

        const colors = [
          "#FF6B6B", // red
          "#4ECDC4", // teal
          "#45B7D1", // blue
          "#FFA07A", // light salmon
          "#98D8C8", // mint
          "#F7DC6F", // yellow
        ];

        const colorIndex = userId.charCodeAt(0) % colors.length;
        const color = colors[colorIndex];

        return (
          <motion.div
            key={userId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed pointer-events-none"
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
              zIndex: 50,
            }}
          >
            {/* Cursor */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.2))` }}
            >
              <path
                d="M0 0L5.5 15L8 8.5L14.5 8L0 0Z"
                fill={color}
              />
            </svg>

            {/* Label */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="absolute left-0 top-5 whitespace-nowrap px-2 py-1 rounded text-xs font-medium text-white"
              style={{
                backgroundColor: color,
                boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
              }}
            >
              {user?.name || "User"}
            </motion.div>
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};

export default RemoteCursor;
