const Review = require("../models/Review");

class ReviewService {
  /**
   * Create a new code review
   */
  async createReview(roomId, code, language, author, reviewer) {
    try {
      const review = await Review.create({
        roomId: roomId.toUpperCase(),
        code,
        language,
        author,
        reviewer,
        status: "pending",
      });

      return await review.populate("author reviewer", "name email profilePicture");
    } catch (error) {
      console.error("Failed to create review:", error);
      throw error;
    }
  }

  /**
   * Add line comment to review
   */
  async addLineComment(reviewId, lineNumber, comment, authorId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");

      const lineComment = {
        lineNumber,
        comment,
        author: authorId,
      };

      review.lineComments.push(lineComment);
      review.totalComments = review.lineComments.length;

      const updated = await review.save();
      return await updated.populate("lineComments.author", "name email profilePicture");
    } catch (error) {
      console.error("Failed to add line comment:", error);
      throw error;
    }
  }

  /**
   * Resolve line comment
   */
  async resolveLineComment(reviewId, commentId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");

      const comment = review.lineComments.id(commentId);
      if (!comment) throw new Error("Comment not found");

      comment.isResolved = true;
      comment.resolvedAt = new Date();

      review.resolvedComments = review.lineComments.filter((c) => c.isResolved).length;

      const updated = await review.save();
      return await updated.populate(
        "lineComments.author",
        "name email profilePicture"
      );
    } catch (error) {
      console.error("Failed to resolve comment:", error);
      throw error;
    }
  }

  /**
   * Update review status
   */
  async updateReviewStatus(reviewId, newStatus, userId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");

      if (review.reviewer.toString() !== userId.toString()) {
        throw new Error("Only the reviewer can update status");
      }

      review.status = newStatus;

      if (newStatus === "approved") {
        review.approvalDate = new Date();
      }

      const updated = await review.save();
      return await updated.populate("author reviewer", "name email profilePicture");
    } catch (error) {
      console.error("Failed to update review status:", error);
      throw error;
    }
  }

  /**
   * Add overall comment to review
   */
  async addOverallComment(reviewId, comment, userId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");

      if (review.reviewer.toString() !== userId.toString()) {
        throw new Error("Only the reviewer can comment");
      }

      review.overallComment = comment;
      review.status = "in-review";

      const updated = await review.save();
      return await updated.populate("author reviewer", "name email profilePicture");
    } catch (error) {
      console.error("Failed to add overall comment:", error);
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReview(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate("author", "name email profilePicture")
        .populate("reviewer", "name email profilePicture")
        .populate("lineComments.author", "name email profilePicture");

      return review;
    } catch (error) {
      console.error("Failed to get review:", error);
      throw error;
    }
  }

  /**
   * Get room reviews
   */
  async getRoomReviews(roomId) {
    try {
      const reviews = await Review.find({ roomId: roomId.toUpperCase() })
        .populate("author reviewer", "name email profilePicture")
        .sort({ createdAt: -1 });

      return reviews;
    } catch (error) {
      console.error("Failed to get room reviews:", error);
      throw error;
    }
  }

  /**
   * Get user's reviews (as reviewer)
   */
  async getReviewerReviews(userId, limit = 10) {
    try {
      const reviews = await Review.find({ reviewer: userId })
        .populate("author", "name email profilePicture")
        .sort({ createdAt: -1 })
        .limit(limit);

      return reviews;
    } catch (error) {
      console.error("Failed to get reviewer reviews:", error);
      throw error;
    }
  }

  /**
   * Get user's reviews (as author)
   */
  async getAuthorReviews(userId, limit = 10) {
    try {
      const reviews = await Review.find({ author: userId })
        .populate("reviewer", "name email profilePicture")
        .sort({ createdAt: -1 })
        .limit(limit);

      return reviews;
    } catch (error) {
      console.error("Failed to get author reviews:", error);
      throw error;
    }
  }

  /**
   * Record code revision
   */
  async recordRevision(reviewId, newCode, userId) {
    try {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");

      review.revisions.push({
        code: newCode,
        changedBy: userId,
      });

      review.code = newCode;

      const updated = await review.save();
      return await updated.populate("author reviewer", "name email profilePicture");
    } catch (error) {
      console.error("Failed to record revision:", error);
      throw error;
    }
  }

  /**
   * Get review history
   */
  async getReviewHistory(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .select("revisions lineComments status createdAt updatedAt")
        .populate("revisions.changedBy", "name email");

      if (!review) throw new Error("Review not found");

      return {
        totalRevisions: review.revisions.length,
        revisions: review.revisions,
        totalComments: review.lineComments.length,
        comments: review.lineComments,
      };
    } catch (error) {
      console.error("Failed to get review history:", error);
      throw error;
    }
  }
}

module.exports = new ReviewService();
