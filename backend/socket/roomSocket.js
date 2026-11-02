const executionService = require("../services/executionService");
const sessionRecordService = require("../services/sessionRecordService");
const Room = require("../models/Room");
const Execution = require("../models/Execution");
const Message = require("../models/Message");
const ExecutionHistory = require("../models/ExecutionHistory");

const registerRoomSocket = (io, socket) => {
  socket.on("join-room", async ({ roomId, user }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.user = user;
    socket.to(roomId).emit("user-joined", { user });
  });

  // ── Session Recording ──
  socket.on("start-recording", async ({ roomId, user, recordingId, room }) => {
    try {
      socket.data.recordingId = recordingId;
      socket.data.sessionStartTime = Date.now();
      
      // Add this participant to the recording
      await sessionRecordService.addParticipant(recordingId, user);
      
      socket.to(roomId).emit("recording-started", { user });
      socket.emit("recording-started-ack", { recordingId, success: true });
    } catch (error) {
      console.error("Failed to start recording:", error);
      socket.emit("recording-error", { message: "Failed to start recording" });
    }
  });

  socket.on("stop-recording", async ({ roomId, user }) => {
    try {
      const recordingId = socket.data.recordingId;
      if (recordingId) {
        await sessionRecordService.endRecording(recordingId);
      }
      socket.to(roomId).emit("recording-stopped", { user });
      socket.emit("recording-stopped-ack", { success: true });
    } catch (error) {
      console.error("Failed to stop recording:", error);
      socket.emit("recording-error", { message: "Failed to stop recording" });
    }
  });

  socket.on("leave-room", ({ roomId, user }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("user-left", { user });
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", { code });
    
    // Record event if recording is active
    if (socket.data.recordingId && socket.data.user) {
      sessionRecordService.addEvent(socket.data.recordingId, {
        type: "code-change",
        code,
        userId: socket.data.user.id,
        userName: socket.data.user.name,
        userProfilePicture: socket.data.user.profilePicture,
        sessionStartTime: socket.data.sessionStartTime,
      }).catch((err) => console.error("Failed to record code-change:", err));
    }
  });

  socket.on("cursor-change", ({ roomId, user, position }) => {
    socket.to(roomId).emit("cursor-change", { user, position });
  });

  socket.on("typing", ({ roomId, user }) => {
    socket.to(roomId).emit("typing", { user });
  });

  socket.on("stop-typing", ({ roomId, user }) => {
    socket.to(roomId).emit("stop-typing", { user });
  });

  // ── Code execution ──
  socket.on("run-code", async ({ roomId, code, language, input }) => {
    io.to(roomId).emit("execution-started");

    try {
      // Use layered execution service (Judge0 -> Local -> Demo)
      const result = await executionService.executeCode(code, language, input);
      io.to(roomId).emit("code-result", result);

      // Create history log entry with engine info
      const history = await ExecutionHistory.create({
        roomId: roomId.toUpperCase(),
        userId: socket.data.user?._id || socket.user?._id,
        code,
        language,
        stdin: input,
        stdout: result.stdout,
        stderr: result.stderr,
        compileOutput: result.compileOutput,
        status: result.status,
        time: result.time,
        memory: result.memory,
        engine: result.engine || "unknown",
      });

      // Populate user info
      const populatedExecution = await history.populate("userId", "name email profilePicture");

      // Broadcast history update to the entire room in real-time
      io.to(roomId).emit("new-execution", populatedExecution);

      // Persist last run for this room
      await Room.findOneAndUpdate({ roomId }, { code, output: result });

      // Record execution event if recording is active
      if (socket.data.recordingId && socket.data.user) {
        await sessionRecordService.addEvent(socket.data.recordingId, {
          type: "execution",
          code,
          language,
          input,
          output: result,
          engine: result.engine,
          userId: socket.data.user.id,
          userName: socket.data.user.name,
          userProfilePicture: socket.data.user.profilePicture,
          sessionStartTime: socket.data.sessionStartTime,
        });
      }
    } catch (error) {
      console.error("Execution error:", error);
      io.to(roomId).emit("code-result", {
        stdout: "",
        stderr: error.message || "Execution failed",
        compileOutput: "",
        status: "Error",
        time: 0,
        memory: 0,
        engine: "none",
      });
    }
  });

  // ── Chat messaging ──
  socket.on("send-message", async ({ roomId, text }) => {
    try {
      // Validate message
      if (!text || typeof text !== "string") {
        return socket.emit("error", { message: "Invalid message" });
      }

      const trimmedText = text.trim();
      if (trimmedText.length === 0) {
        return socket.emit("error", { message: "Message cannot be empty" });
      }

      if (trimmedText.length > 1000) {
        return socket.emit("error", { message: "Message too long (max 1000 chars)" });
      }

      const msg = await Message.create({
        roomId: roomId.toUpperCase(),
        user: socket.data.user?._id || socket.user?._id,
        text: trimmedText,
      });

      // Populate user info with profile picture for display
      const populatedMsg = await msg.populate("user", "name email profilePicture");
      io.to(roomId).emit("new-message", populatedMsg);

      // Record message event if recording is active
      if (socket.data.recordingId && socket.data.user) {
        await sessionRecordService.addEvent(socket.data.recordingId, {
          type: "message",
          text: trimmedText,
          userId: socket.data.user.id,
          userName: socket.data.user.name,
          userProfilePicture: socket.data.user.profilePicture,
          sessionStartTime: socket.data.sessionStartTime,
        });
      }
    } catch (error) {
      console.error("Error broadcasting message:", error.message);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  socket.on("chat-typing", ({ roomId, user }) => {
    socket.to(roomId).emit("chat-typing", { user });
  });

  socket.on("chat-stop-typing", ({ roomId, user }) => {
    socket.to(roomId).emit("chat-stop-typing", { user });
  });

  // ── Video calling ──
  socket.on("video-call-start", ({ roomId, user, peerId }) => {
    console.log(`User ${user.name} started video call in room ${roomId} with peer ID: ${peerId}`);
    socket.data.peerId = peerId;
    socket.to(roomId).emit("video-call-started", { user, peerId });
  });

  socket.on("video-call-end", ({ roomId, user }) => {
    console.log(`User ${user.name} ended video call in room ${roomId}`);
    socket.to(roomId).emit("video-call-ended", { user, peerId: socket.data.peerId });
  });

  socket.on("peer-id-update", ({ roomId, peerId, user }) => {
    console.log(`Peer ID update from ${user.name}: ${peerId}`);
    socket.data.peerId = peerId;
    // Broadcast to others in the room so they can initiate calls
    socket.to(roomId).emit("peer-joined", { user, peerId });
  });

  socket.on("disconnect", () => {
    const { roomId, user, peerId } = socket.data || {};
    if (roomId && user) {
      socket.to(roomId).emit("user-left", { user, peerId });
      // Notify others that this peer is disconnected
      if (peerId) {
        socket.to(roomId).emit("peer-left", { peerId, user });
      }
    }
  });
};

module.exports = registerRoomSocket;
