import React, { useContext, useState, useEffect } from "react";
import { IoSearchOutline, IoHeart, IoChatbubble, IoPeopleOutline } from "react-icons/io5";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import CreatePostModal from "../components/CreatePostModal";
import CommentModal from "../components/CommentModal";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

export default function Explore() {
  const { postData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  useEffect(() => {
    if (!searchFilter.trim()) {
      setSearchedUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingUsers(true);
        const res = await axios.get(
          `${serverUrl}/api/user/search?query=${encodeURIComponent(searchFilter.trim())}`,
          { withCredentials: true }
        );
        setSearchedUsers(res.data || []);
      } catch {
        setSearchedUsers([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchFilter, serverUrl]);

  const filteredPosts = postData.filter((post) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const desc = (post.description || "").toLowerCase();
    const author = (post.author?.userName || "").toLowerCase();
    return desc.includes(q) || author.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Nav */}
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        <main className="flex-1 max-w-[940px] w-full mx-auto px-2 sm:px-4 py-4 md:py-6 pb-20 md:pb-8 flex flex-col gap-5">
          
          {/* Search Header for Mobile & Tablet */}
          <div className="w-full">
            <div className="w-full h-11 bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl flex items-center px-4 gap-2.5 text-gray-500 focus-within:ring-2 focus-within:ring-[#e1306c]/40 transition">
              <IoSearchOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search database users, skills, posts..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
              {isSearchingUsers && (
                <div className="w-3.5 h-3.5 border-2 border-[#e1306c] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Database People Search Results Section */}
          {searchFilter.trim() && searchedUsers.length > 0 && (
            <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl p-3 shadow-xs">
              <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
                <IoPeopleOutline className="w-3.5 h-3.5 text-[#e1306c]" />
                Matching Users ({searchedUsers.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchedUsers.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleGetProfile(user.userName)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1c1c1e] cursor-pointer transition"
                  >
                    <img
                      src={user.profileImage || dp}
                      alt={user.firstName}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        @{user.userName}
                      </p>
                      {user.headline && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {user.headline}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3x3 Instagram Explore Grid */}
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            {filteredPosts.map((post) => {
              const likeCount = post.like?.length || 0;
              const commentCount = post.comment?.length || 0;

              return (
                <div
                  key={post._id}
                  onClick={() => setActiveCommentPostId(post._id)}
                  className="relative aspect-square bg-gray-100 dark:bg-[#121212] overflow-hidden rounded-md sm:rounded-xl cursor-pointer group select-none border border-gray-100 dark:border-gray-800"
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full p-3 flex flex-col justify-between bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-[#18181b] dark:to-[#27272a] text-gray-800 dark:text-gray-200">
                      <p className="text-[11px] sm:text-xs line-clamp-4 leading-relaxed font-medium">
                        {post.description}
                      </p>
                      <span className="text-[10px] text-gray-400 font-bold">
                        @{post.author?.userName}
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay with Likes and Comments */}
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 sm:gap-6 text-white font-bold text-xs sm:text-sm transition-opacity duration-200 pointer-events-none">
                    <span className="flex items-center gap-1.5">
                      <IoHeart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      {likeCount}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <IoChatbubble className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      {commentCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </main>

        <BottomNav onOpenCreatePost={() => setIsCreateOpen(true)} />
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {activeCommentPostId && (
        <CommentModal
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}

    </div>
  );
}
