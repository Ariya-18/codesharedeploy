import api from "./api";

export const createReview = (data) => api.post("/reviews", data);
export const getReview = (id) => api.get(`/reviews/${id}`);
export const getRoomReviews = (roomId) => api.get(`/reviews/room/${roomId}`);
export const getReviewerReviews = () => api.get("/reviews/reviewer/list");
export const getAuthorReviews = () => api.get("/reviews/author/list");
export const getReviewHistory = (id) => api.get(`/reviews/${id}/history`);

export const addLineComment = (reviewId, lineNumber, comment) =>
  api.post(`/reviews/${reviewId}/comments`, { lineNumber, comment });

export const resolveLineComment = (reviewId, commentId) =>
  api.put(`/reviews/${reviewId}/comments/${commentId}/resolve`);

export const updateReviewStatus = (id, status) =>
  api.put(`/reviews/${id}/status`, { status });

export const addOverallComment = (id, comment) =>
  api.post(`/reviews/${id}/overall-comment`, { comment });

export const recordRevision = (id, code) =>
  api.post(`/reviews/${id}/revisions`, { code });
