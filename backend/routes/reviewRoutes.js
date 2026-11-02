const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  createReview,
  addLineComment,
  resolveLineComment,
  updateReviewStatus,
  addOverallComment,
  getReview,
  getRoomReviews,
  getReviewerReviews,
  getAuthorReviews,
  recordRevision,
  getReviewHistory,
} = require("../controllers/reviewController");

router.post("/", protect, createReview);
router.get("/:id", protect, getReview);
router.get("/room/:roomId", protect, getRoomReviews);
router.get("/reviewer/list", protect, getReviewerReviews);
router.get("/author/list", protect, getAuthorReviews);
router.get("/:id/history", protect, getReviewHistory);

router.post("/:id/comments", protect, addLineComment);
router.put("/:id/comments/:commentId/resolve", protect, resolveLineComment);

router.put("/:id/status", protect, updateReviewStatus);
router.post("/:id/overall-comment", protect, addOverallComment);
router.post("/:id/revisions", protect, recordRevision);

module.exports = router;
