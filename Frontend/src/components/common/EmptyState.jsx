import { motion } from "framer-motion";

const EmptyState = ({ icon: Icon, title, description, action, actionText }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="mb-4 p-3 rounded-full bg-white/5">
        <Icon size={32} className="text-muted opacity-40" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-muted mb-6 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
