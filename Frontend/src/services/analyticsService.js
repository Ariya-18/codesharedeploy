import api from "./api";

export const generateAnalytics = (recordingId) =>
  api.post("/analyze/generate", { recordingId });

export const getRoomAnalytics = (roomId) =>
  api.get(`/analyze/room/${roomId}`);

export const getUserAnalytics = () =>
  api.get("/analyze/user");

export const getSessionAnalytics = (sessionId) =>
  api.get(`/analyze/session/${sessionId}`);

export const analyzeCode = (code, language) =>
  api.post("/analyze/complexity", { code, language });
