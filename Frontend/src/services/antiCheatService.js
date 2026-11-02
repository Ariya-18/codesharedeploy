import api from "./api";

export const logAntiCheatEvent = (roomId, type, details) => api.post(`/anti-cheat/${roomId}`, { type, details });
export const getAntiCheatLogs = (roomId) => api.get(`/anti-cheat/${roomId}`);
