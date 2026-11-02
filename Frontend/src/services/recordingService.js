import api from "./api";

export const getRecording = (id) => api.get(`/recordings/${id}`);
export const getRoomRecordings = (roomId) => api.get(`/recordings/room/${roomId}`);
