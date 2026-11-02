const LoadingSkeleton = ({ count = 1, type = "card" }) => {
  if (type === "card") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-lg bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-white/5 rounded animate-pulse"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          />
        ))}
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className="h-12 rounded-lg bg-white/5 animate-pulse" />
    );
  }

  return null;
};

export default LoadingSkeleton;
