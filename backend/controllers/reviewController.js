const reviewService = require("../services/reviewService");
const Room = require("../models/Room");

// @desc  Create a new code review
// @route POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { roomId, code, language, reviewerId } = req.body;

    const room = await Room.findOne({ roomId: roomId?.toUpperCase() });
    if (!room) return res.status(404).json({ message: "Room not found" });

    const review = await reviewService.createReview(
      roomId,
      code,
      language,
      req.user._id,
      reviewerId
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Add line comment to review
// @route POST /api/reviews/:id/comments
exports.addLineComment = async (req, res) => {
  try {
    const { lineNumber, comment } = req.body;

    const review = await reviewService.addLineComment(
      req.params.id,
      lineNumber,
      comment,
      req.user._id
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Resolve line comment
// @route PUT /api/reviews/:id/comments/:commentId/resolve
exports.resolveLineComment = async (req, res) => {
  try {
    const review = await reviewService.resolveLineComment(
      req.params.id,
      req.params.commentId
    );

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Update review status (approve/reject/needs-revision)
// @route PUT /api/reviews/:id/status
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "in-review", "approved", "rejected", "needs-revision"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const review = await reviewService.updateReviewStatus(
      req.params.id,
      status,
      req.user._id
    );

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Add overall comment to review
// @route POST /api/reviews/:id/overall-comment
exports.addOverallComment = async (req, res) => {
  try {
    const { comment } = req.body;

    const review = await reviewService.addOverallComment(
      req.params.id,
      comment,
      req.user._id
    );

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get review by ID
// @route GET /api/reviews/:id
exports.getReview = async (req, res) => {
  try {
    const review = await reviewService.getReview(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get room reviews
// @route GET /api/reviews/room/:roomId
exports.getRoomReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getRoomReviews(req.params.roomId);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get reviewer's reviews
// @route GET /api/reviews/reviewer/list
exports.getReviewerReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewerReviews(req.user._id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get author's reviews
// @route GET /api/reviews/author/list
exports.getAuthorReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getAuthorReviews(req.user._id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Record code revision
// @route POST /api/reviews/:id/revisions
exports.recordRevision = async (req, res) => {
  try {
    const { code } = req.body;

    const review = await reviewService.recordRevision(req.params.id, code, req.user._id);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc  Get review history
// @route GET /api/reviews/:id/history
exports.getReviewHistory = async (req, res) => {
  try {
    const history = await reviewService.getReviewHistory(req.params.id);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
