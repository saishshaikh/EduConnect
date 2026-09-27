import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoSearchOutline,
  IoHeart,
  IoChatbubble,
  IoPeopleOutline,
  IoChatbubbleEllipsesOutline,
  IoSparklesOutline,
} from "react-icons/io5";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import CreatePostModal from "../components/CreatePostModal";
import CommentModal from "../components/CommentModal";
import ConnectionButton from "../components/ConnectionButton";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import axios from "axios";

export default function Explore() {
  const { userData, postData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  // Fetch initial registered users from database to discover
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/search`, {
          withCredentials: true,
        });
        const list = (res.data || []).filter((u) => u._id !== userData?._id);
        setDiscoverUsers(list);
      } catch (err) {
        console.error("Error fetching discover users:", err);
      }
    };
    if (userData?._id) {
      fetchAllUsers();
    }
  }, [userData?._id, serverUrl]);

  // Live search users on typing
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
        const list = (res.data || []).filter((u) => u._id !== userData?._id);
        setSearchedUsers(list);
      } catch {
        setSearchedUsers([]);
      } finally {
        setIsSearchingUsers(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchFilter, userData?._id, serverUrl]);

  const filteredPosts = postData.filter((post) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const desc = (post.description || "").toLowerCase();
    const author = (post.author?.userName || "").toLowerCase();
    return desc.includes(q) || author.includes(q);
  });

  const displayUsers = searchFilter.trim() ? searchedUsers : discoverUsers;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Nav */}
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        <main className="flex-1 max-w-[940px] w-full mx-auto px-2 sm:px-4 py-4 md:py-6 pb-20 md:pb-8 flex flex-col gap-6">
          
          {/* Search Header for Mobile & Desktop */}
          <div className="w-full">
            <div className="w-full h-11 bg-gray-100 dark:bg-[#1c1c1e] rounded-2xl flex items-center px-4 gap-2.5 text-gray-500 focus-within:ring-2 focus-within:ring-[#e1306c]/40 transition">
              <IoSearchOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search registered database users, username, skills..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-transparent outline-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400"
              />
              {isSearchingUsers && (
                <div className="w-3.5 h-3.5 border-2 border-[#e1306c] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Database People Section (Discover / Search Results) */}
          {displayUsers.length > 0 && (
            <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 px-1">
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  {searchFilter.trim() ? (
                    <>
                      <IoPeopleOutline className="w-4 h-4 text-[#e1306c]" />
                      Search Results ({displayUsers.length})
                    </>
                  ) : (
                    <>
                      <IoSparklesOutline className="w-4 h-4 text-[#0095f6]" />
                      Discover Registered Peers ({displayUsers.length})
                    </>
                  )}
                </p>
                <span className="text-[11px] text-gray-400">Database Users</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50/70 dark:bg-[#18181b] border border-gray-100 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 transition gap-3"
                  >
                    <div
                      onClick={() => handleGetProfile(user.userName)}
                      className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                    >
                      <img
                        src={user.profileImage || dp}
                        alt={user.firstName}
                        className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1 leading-tight">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate hover:text-[#e1306c] transition">
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

                    <div className="flex items-center gap-1.5 flex-shrink-0 scale-90 sm:scale-100 origin-right">
                      <ConnectionButton userId={user._id} />
                      <button
                        onClick={() => navigate(`/chat/${user._id}`)}
                        className="p-2 rounded-full bg-gray-200/80 dark:bg-gray-800 hover:bg-[#0095f6] hover:text-white text-gray-700 dark:text-gray-300 transition"
                        title="Send Message"
                      >
                        <IoChatbubbleEllipsesOutline className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchFilter.trim() && displayUsers.length === 0 && !isSearchingUsers && (
            <div className="p-8 text-center bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-[#262626] text-xs text-gray-500">
              No registered users found matching "<span className="font-bold text-gray-800 dark:text-gray-200">{searchFilter}</span>" in database.
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
