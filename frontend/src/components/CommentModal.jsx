import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { IoClose, IoSend } from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

export default function CommentModal({ postId, onClose }) {
  const { userData, postData, setPostData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { socket } = useContext(SocketContext);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  useEffect(() => {
    const found = postData.find((p) => p._id === postId);
    if (found) {
      setCurrentPost(found);
      setComments(found.comment || []);
    }
  }, [postId, postData]);

  // Live comment updates
  useEffect(() => {
    if (!socket) return;
    const handleCommentAdded = ({ postId: pId, comm }) => {
      if (pId === postId) {
        setComments(comm);
      }
    };
    socket.on("commentAdded", handleCommentAdded);
    return () => socket.off("commentAdded", handleCommentAdded);
  }, [socket, postId]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const text = commentText.trim();
    if (!text || loading) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${serverUrl}/api/post/comment/${postId}`,
        { content: text },
        { withCredentials: true }
      );
      setCommentText("");
      if (res.data?.comment) {
        setComments(res.data.comment);
        // Update global postData
        setPostData((prev) =>
          prev.map((p) => (p._id === postId ? res.data : p))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div
        className="w-full max-w-[520px] h-[82vh] sm:h-[650px] bg-white dark:bg-[#121212] rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-gray-200 dark:border-[#262626] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
          <div className="w-6" /> {/* Spacer */}
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-[#1c1c1e] transition"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 divide-y divide-gray-50 dark:divide-[#1c1c1e]">
          {/* Original Post Caption */}
          {currentPost?.description && (
            <div className="flex gap-3 pb-3">
              <img
                src={currentPost.author?.profileImage || dp}
                alt=""
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="text-xs leading-relaxed">
                <span className="font-bold text-gray-900 dark:text-white mr-1.5">
                  {currentPost.author?.userName || "user"}
                </span>
                <span className="text-gray-800 dark:text-gray-200">
                  {currentPost.description}
                </span>
                <p className="text-[10px] text-gray-400 mt-1">
                  {moment(currentPost.createdAt).fromNow()}
                </p>
              </div>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400">
              <p className="text-sm font-medium">No comments yet.</p>
              <p className="text-xs text-gray-500 mt-1">Start the conversation.</p>
            </div>
          ) : (
            comments.map((comm, idx) => (
              <div key={comm._id || idx} className="flex gap-3 pt-3">
                <img
                  src={comm.user?.profileImage || dp}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => comm.user?.userName && handleGetProfile(comm.user.userName)}
                />
                <div className="flex-1 text-xs leading-relaxed">
                  <span
                    onClick={() => comm.user?.userName && handleGetProfile(comm.user.userName)}
                    className="font-bold text-gray-900 dark:text-white mr-1.5 cursor-pointer hover:underline"
                  >
                    {comm.user?.userName || comm.user?.firstName || "user"}
                  </span>
                  <span className="text-gray-800 dark:text-gray-200">
                    {comm.content}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 mt-1">
                    <span>{moment(comm.createdAt || Date.now()).fromNow(true)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Comment Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-gray-50 dark:bg-[#18181b] border-t border-gray-100 dark:border-[#262626] flex items-center gap-3"
        >
          <img
            src={userData?.profileImage || dp}
            alt=""
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
          <input
            type="text"
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-transparent outline-none text-xs text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || loading}
            className="text-[#0095f6] font-bold text-xs disabled:opacity-40 hover:text-[#0074cc] transition flex-shrink-0"
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
