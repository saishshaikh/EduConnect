import React, { useContext, useState, useEffect, useRef } from "react";
import moment from "moment";
import axios from "axios";
import {
  IoHeartOutline,
  IoHeart,
  IoChatbubbleOutline,
  IoPaperPlaneOutline,
  IoBookmarkOutline,
  IoBookmark,
  IoEllipsisHorizontal,
  IoSend,
  IoCheckmark,
} from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

export default function PostCard({
  id,
  description,
  author,
  image,
  like = [],
  comment = [],
  createdAt,
  onOpenComments,
}) {
  const { userData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { socket } = useContext(SocketContext);

  const [likes, setLikes] = useState(like || []);
  const [commentsList, setCommentsList] = useState(comment || []);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);

  const isLiked = userData?._id ? likes.includes(userData._id) : false;

  // Listen to live like/comment updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleLikeUpdated = ({ postId, likes: updatedLikes }) => {
      if (postId === id) {
        setLikes(updatedLikes);
      }
    };

    const handleCommentAdded = ({ postId, comm }) => {
      if (postId === id) {
        setCommentsList(comm);
      }
    };

    socket.on("likeUpdated", handleLikeUpdated);
    socket.on("commentAdded", handleCommentAdded);

    return () => {
      socket.off("likeUpdated", handleLikeUpdated);
      socket.off("commentAdded", handleCommentAdded);
    };
  }, [socket, id]);

  // Handle Like
  const handleLike = async () => {
    if (!userData?._id) return;

    // Optimistic UI update
    if (isLiked) {
      setLikes((prev) => prev.filter((uid) => uid !== userData._id));
    } else {
      setLikes((prev) => [...prev, userData._id]);
    }

    try {
      await axios.get(`${serverUrl}/api/post/like/${id}`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  // Double tap image to like with pop animation
  const handleDoubleTap = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 850);
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e?.preventDefault();
    const text = commentText.trim();
    if (!text || submittingComment) return;

    try {
      setSubmittingComment(true);
      const res = await axios.post(
        `${serverUrl}/api/post/comment/${id}`,
        { content: text },
        { withCredentials: true }
      );
      setCommentText("");
      if (res.data?.comment) {
        setCommentsList(res.data.comment);
      }
    } catch (err) {
      console.error("Comment error:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Copy Post Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 1500);
  };

  return (
    <article className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-[#262626] shadow-xs mb-4 overflow-hidden transition-colors duration-200">
      
      {/* 1. POST HEADER */}
      <div className="p-3.5 flex items-center justify-between">
        <div
          onClick={() => author?.userName && handleGetProfile(author.userName)}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full story-gradient p-[2px] transition-transform group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-[1.5px]">
              <img
                src={author?.profileImage || dp}
                alt={author?.firstName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-gray-900 dark:text-white group-hover:text-[#e1306c] transition">
                {author ? `${author.firstName} ${author.lastName}` : "EduConnect User"}
              </span>
              <span className="text-gray-400 dark:text-gray-500 text-xs">•</span>
              <span className="text-[12px] text-gray-400 dark:text-gray-500">
                {createdAt ? moment(createdAt).fromNow(true) : ""}
              </span>
            </div>
            {author?.headline && (
              <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate max-w-[240px] sm:max-w-[320px]">
                {author.headline}
              </p>
            )}
          </div>
        </div>

        {/* Three Dots Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-[#1c1c1e] transition"
          >
            <IoEllipsisHorizontal className="w-5 h-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#262626] rounded-xl shadow-xl py-1.5 z-20 text-xs font-medium">
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#27272a] flex items-center justify-between text-gray-700 dark:text-gray-200"
              >
                <span>{copied ? "Link Copied!" : "Copy Link"}</span>
                {copied && <IoCheckmark className="w-4 h-4 text-emerald-500" />}
              </button>
              {author?._id === userData?._id && (
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500"
                >
                  Delete Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. POST MEDIA / IMAGE */}
      {image ? (
        <div
          onDoubleClick={handleDoubleTap}
          className="relative w-full bg-black/5 dark:bg-black/40 overflow-hidden select-none cursor-pointer flex items-center justify-center max-h-[580px]"
        >
          <img
            src={image}
            alt="Post content"
            className="w-full h-auto max-h-[580px] object-cover"
          />

          {/* Heart Pop Animation on Double Click */}
          {showHeartAnim && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <IoHeart className="w-24 h-24 text-white drop-shadow-2xl heart-animation" />
            </div>
          )}
        </div>
      ) : null}

      {/* 3. POST ACTION BUTTONS */}
      <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          
          {/* Heart / Like Button */}
          <button
            onClick={handleLike}
            className="text-gray-800 dark:text-gray-200 hover:scale-115 active:scale-90 transition transform"
          >
            {isLiked ? (
              <IoHeart className="w-[26px] h-[26px] text-[#e1306c] animate-scale" />
            ) : (
              <IoHeartOutline className="w-[26px] h-[26px] hover:text-[#e1306c]" />
            )}
          </button>

          {/* Comment Button */}
          <button
            onClick={() => onOpenComments ? onOpenComments(id) : null}
            className="text-gray-800 dark:text-gray-200 hover:text-[#e1306c] hover:scale-115 active:scale-90 transition transform"
          >
            <IoChatbubbleOutline className="w-[24px] h-[24px]" />
          </button>

          {/* Share Button */}
          <button
            onClick={handleCopyLink}
            className="text-gray-800 dark:text-gray-200 hover:text-[#e1306c] hover:scale-115 active:scale-90 transition transform"
          >
            <IoPaperPlaneOutline className="w-[23px] h-[23px]" />
          </button>

        </div>

        {/* Bookmark / Save */}
        <button
          onClick={() => setIsSaved((prev) => !prev)}
          className="text-gray-800 dark:text-gray-200 hover:scale-115 active:scale-90 transition transform"
        >
          {isSaved ? (
            <IoBookmark className="w-[24px] h-[24px] text-gray-900 dark:text-white" />
          ) : (
            <IoBookmarkOutline className="w-[24px] h-[24px]" />
          )}
        </button>
      </div>

      {/* 4. LIKES COUNT & CAPTION */}
      <div className="px-3.5 py-1.5 flex flex-col gap-1 text-[13px]">
        
        {/* Likes count */}
        {likes.length > 0 && (
          <p className="font-bold text-gray-900 dark:text-white">
            {likes.length} {likes.length === 1 ? "like" : "likes"}
          </p>
        )}

        {/* Caption */}
        {description && (
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
            <span
              onClick={() => author?.userName && handleGetProfile(author.userName)}
              className="font-bold mr-2 text-gray-900 dark:text-white cursor-pointer hover:underline"
            >
              {author?.userName || "user"}
            </span>
            <span>
              {expandedCaption || description.length <= 120
                ? description
                : `${description.slice(0, 120)}... `}
            </span>
            {description.length > 120 && (
              <button
                onClick={() => setExpandedCaption((prev) => !prev)}
                className="text-gray-400 dark:text-gray-500 font-medium ml-1 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {expandedCaption ? "less" : "more"}
              </button>
            )}
          </div>
        )}

        {/* View all comments link */}
        {commentsList.length > 0 && (
          <button
            onClick={() => onOpenComments ? onOpenComments(id) : null}
            className="text-gray-400 dark:text-gray-500 text-left text-xs font-medium mt-0.5 hover:text-gray-600 dark:hover:text-gray-300"
          >
            View all {commentsList.length} {commentsList.length === 1 ? "comment" : "comments"}
          </button>
        )}

        {/* Latest comment snippet */}
        {commentsList.length > 0 && (
          <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
            <span className="font-bold mr-1 text-gray-900 dark:text-white">
              {commentsList[commentsList.length - 1]?.user?.firstName || "User"}
            </span>
            <span>{commentsList[commentsList.length - 1]?.content}</span>
          </div>
        )}

      </div>

      {/* 5. INLINE COMMENT FORM */}
      <form
        onSubmit={handleAddComment}
        className="px-3.5 py-2.5 mt-1 border-t border-gray-100 dark:border-[#262626] flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full bg-transparent outline-none text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400"
        />

        {commentText.trim() && (
          <button
            type="submit"
            disabled={submittingComment}
            className="text-[#0095f6] font-bold text-xs hover:text-[#0074cc] transition disabled:opacity-50 flex-shrink-0"
          >
            Post
          </button>
        )}
      </form>

    </article>
  );
}
