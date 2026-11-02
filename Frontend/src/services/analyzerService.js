import api from "./api";

export const analyzeCode = (code, language) => api.post(`/analyze`, { code, language });
