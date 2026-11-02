const dotenv = require("dotenv");
dotenv.config(); // must run before any other local requires

const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const { apiLimiter } = require("./middlewares/rateLimitMiddleware");
const connectDB = require("./config/db");
const initSocket = require("./socket");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const executionRoutes = require("./routes/executionRoutes");
const recordingRoutes = require("./routes/recordingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const analyzerRoutes = require("./routes/analyzerRoutes");
const antiCheatRoutes = require("./routes/antiCheatRoutes");
const scorecardRoutes = require("./routes/scorecardRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

connectDB();

const app = express();

// Allow both 5173 and 5174 for frontend (Vite may use either)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(apiLimiter); // Apply global rate limiting
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/execute", executionRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/analyze", analyzerRoutes);
app.use("/api/anti-cheat", antiCheatRoutes);
app.use("/api/scorecards", scorecardRoutes);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
