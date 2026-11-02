import { useState, useEffect } from "react";
import { getRoomReviews, addLineComment, updateReviewStatus, addOverallComment } from "../../services/reviewService";
import { CheckCircle, XCircle, Send, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

const MentorReviewPanel = ({ roomId, currentUser }) => {
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newCommentLine, setNewCommentLine] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  useEffect(() => {
    getRoomReviews(roomId)
      .then(res => setReview(res.data?.[0]))
      .catch(() => toast.error("Failed to load review"))
      .finally(() => setLoading(false));
  }, [roomId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !review?._id) return;
    
    try {
      const lineNum = Number(newCommentLine) || 1;
      const res = await addLineComment(review._id, lineNum, newCommentText);
      setReview(res.data);
      setNewCommentText("");
      setNewCommentLine("");
      toast.success("Comment added");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!review?._id) return;
    try {
      const res = await updateReviewStatus(review._id, status);
      setReview(res.data);
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-4 text-center text-muted">Loading review...</div>;

  return (
    <div className="flex flex-col h-full overflow-hidden text-sm">
      <div className="border-b border-white/10 p-3 flex justify-between items-center">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            Mentor Review
            {review?.status === "approved" && <CheckCircle size={14} className="text-success" />}
            {review?.status === "rejected" && <XCircle size={14} className="text-danger" />}
          </h3>
          <p className="text-xs text-muted">Status: {review?.status || "pending"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleUpdateStatus("approved")} className="bg-success/20 text-success hover:bg-success/30 px-2 py-1 rounded text-xs font-medium transition">
            Approve
          </button>
          <button onClick={() => handleUpdateStatus("rejected")} className="bg-danger/20 text-danger hover:bg-danger/30 px-2 py-1 rounded text-xs font-medium transition">
            Reject
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {review?.lineComments?.length === 0 ? (
          <div className="text-center text-muted text-xs mt-4">No comments yet.</div>
        ) : (
          review?.lineComments?.map((c, i) => (
            <div key={i} className="bg-white/5 border border-white/10 p-2 rounded-lg">
              <div className="text-xs text-primary font-mono mb-1">
                {c.lineNumber > 0 ? `Line ${c.lineNumber}` : 'General Comment'}
              </div>
              <div className="text-white text-xs">{c.comment}</div>
              <div className="text-[10px] text-muted mt-1">{c.author?.name}</div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className="border-t border-white/10 p-3 bg-black/20 flex flex-col gap-2">
        <input 
          type="number"
          placeholder="Line number (optional)"
          value={newCommentLine}
          onChange={e => setNewCommentLine(e.target.value)}
          className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
        />
        <div className="flex gap-2">
          <input 
            type="text"
            placeholder="Add feedback..."
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
          />
          <button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded px-3 flex items-center justify-center">
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorReviewPanel;
