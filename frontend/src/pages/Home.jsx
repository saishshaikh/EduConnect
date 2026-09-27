import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import StoriesBar from "../components/StoriesBar";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import CommentModal from "../components/CommentModal";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/userContext";
import { authDataContext } from "../context/AuthContext";
import ConnectionButton from "../components/ConnectionButton";

export default function Home() {
  const { userData, postData, setPostData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Fetch suggested connections for right rail on desktop
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setLoadingSuggestions(true);
        const res = await axios.get(`${serverUrl}/api/user/search?query=a`, {
          withCredentials: true,
        });
        const list = (res.data || []).filter(
          (u) => u._id !== userData?._id
        );
        setSuggestedUsers(list.slice(0, 5));
      } catch {
        setSuggestedUsers([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    if (userData?._id) {
      fetchSuggestions();
    }
  }, [userData?._id, serverUrl]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* 1. Desktop Sidebar Navigation */}
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Minimal Top Header */}
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        {/* Feed Layout */}
        <main className="flex-1 max-w-[980px] w-full mx-auto px-2 sm:px-4 py-4 md:py-6 flex justify-center gap-8 pb-20 md:pb-8">
          
          {/* Main Feed Column */}
          <div className="w-full max-w-[490px] flex flex-col">
            
            {/* Stories Section */}
            <StoriesBar connections={suggestedUsers} />

            {/* Posts List */}
            {postData.length === 0 ? (
              <div className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-[#262626] p-8 text-center flex flex-col items-center gap-3 mt-2 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#fd1d1d] to-[#833ab4] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                  ✨
                </div>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                  Welcome to your Feed!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[280px]">
                  Share your first post, project, or learning update with fellow students and educators.
                </p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="mt-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white font-bold text-xs shadow-md hover:opacity-90 active:scale-95 transition"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              postData.map((post) => (
                <PostCard
                  key={post._id}
                  id={post._id}
                  description={post.description}
                  author={post.author}
                  image={post.image}
                  like={post.like}
                  comment={post.comment}
                  createdAt={post.createdAt}
                  onOpenComments={(postId) => setActiveCommentPostId(postId)}
                />
              ))
            )}
          </div>

          {/* Right Rail: Profile & Suggestions (Desktop Only) */}
          <div className="hidden lg:flex flex-col w-[300px] gap-5 pt-1 select-none">
            
            {/* Current User Card */}
            {userData && (
              <div className="flex items-center justify-between">
                <div
                  onClick={() => handleGetProfile(userData.userName)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <img
                    src={userData.profileImage || dp}
                    alt={userData.firstName}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition"
                  />
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#e1306c] transition">
                      {userData.userName}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                      {userData.firstName} {userData.lastName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="text-xs font-bold text-[#0095f6] hover:text-[#0074cc] transition"
                >
                  Switch
                </button>
              </div>
            )}

            {/* Suggested Connections Header */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-gray-500 dark:text-gray-400">
                Suggested for you
              </span>
              <button
                onClick={() => navigate("/network")}
                className="font-bold text-gray-800 dark:text-gray-200 hover:text-gray-500 dark:hover:text-gray-400 transition"
              >
                See All
              </button>
            </div>

            {/* Suggestions List */}
            <div className="flex flex-col gap-3">
              {suggestedUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div
                    onClick={() => handleGetProfile(user.userName)}
                    className="flex items-center gap-3 cursor-pointer group min-w-0"
                  >
                    <img
                      src={user.profileImage || dp}
                      alt={user.firstName}
                      className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                    <div className="leading-tight truncate">
                      <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#e1306c] transition truncate">
                        {user.userName}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {user.headline || `${user.firstName} ${user.lastName}`}
                      </p>
                    </div>
                  </div>

                  <div className="ml-2 flex-shrink-0 scale-90 origin-right">
                    <ConnectionButton userId={user._id} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Links */}
            <div className="text-[11px] text-gray-400 dark:text-gray-600 flex flex-col gap-2 pt-4 border-t border-gray-100 dark:border-[#262626]">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <span>About</span>
                <span>•</span>
                <span>Help</span>
                <span>•</span>
                <span>Privacy</span>
                <span>•</span>
                <span>Terms</span>
                <span>•</span>
                <span>Locations</span>
              </div>
              <p className="text-[10px] uppercase font-semibold tracking-wider">
                © 2026 EduConnect from Meta-learning
              </p>
            </div>

          </div>

        </main>

        {/* 3. Mobile Bottom Navigation */}
        <BottomNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Comments Sliding Sheet */}
      {activeCommentPostId && (
        <CommentModal
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}

    </div>
  );
}
