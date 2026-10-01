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
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import ConnectionButton from "../components/ConnectionButton";
import EducationFeatureCards from "../components/EducationFeatureCards";
import {
  IoImageOutline,
  IoSparklesOutline,
  IoRefreshOutline,
  IoCompassOutline,
  IoArrowForward,
} from "react-icons/io5";

export default function Feed() {
  const { userData, postData, handleGetProfile, handleGetPost } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch suggested users for right rail
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/suggestedusers`, {
          withCredentials: true,
        });
        const list = (res.data || []).filter((u) => u._id !== userData?._id);
        setSuggestedUsers(list.slice(0, 5));
      } catch {
        try {
          const allRes = await axios.get(`${serverUrl}/api/user/search`, {
            withCredentials: true,
          });
          const allList = (allRes.data || []).filter((u) => u._id !== userData?._id);
          setSuggestedUsers(allList.slice(0, 5));
        } catch (e) {
          console.error("Error fetching suggested users:", e);
        }
      }
    };

    if (userData?._id) {
      fetchSuggestions();
    }
  }, [userData?._id, serverUrl]);

  const handleRefreshFeed = async () => {
    try {
      setRefreshing(true);
      await handleGetPost();
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const primaryColorClass = isEducation ? "text-[#0066ff]" : "text-[#e1306c]";
  const primaryBgClass = isEducation ? "bg-[#0066ff]" : "bg-[#e1306c]";

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* 1. Desktop Sidebar Navigation */}
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        {/* Feed Page Layout */}
        <main className="flex-1 max-w-[1120px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-20 md:pb-8 flex flex-col gap-6">
          
          {/* Feed Page Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${primaryBgClass}`} />
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  User Feed & Academic Community
                </h1>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time discussions, project breakthroughs, and study updates from your network.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefreshFeed}
                disabled={refreshing}
                className="p-2 rounded-xl bg-white dark:bg-[#18181b] border border-gray-200/80 dark:border-[#262626] text-gray-700 dark:text-gray-300 hover:text-[#0066ff] shadow-xs transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
                title="Refresh Feed"
              >
                <IoRefreshOutline className={`w-4 h-4 ${refreshing ? "animate-spin text-[#0066ff]" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Two-Column Feed Hub */}
          <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Main Feed Column */}
            <div className="w-full lg:flex-1 max-w-[660px] mx-auto lg:mx-0 flex flex-col gap-4">
              
              {/* Stories Bar */}
              <StoriesBar />

              {/* Quick Create Post Composer Card */}
              {userData && (
                <div
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-[#262626] p-3.5 shadow-xs hover:border-gray-300 dark:hover:border-gray-700 cursor-pointer transition flex items-center justify-between gap-3 select-none"
                >
                  <img
                    src={userData.profileImage || dp}
                    alt={userData.firstName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                  />
                  <div className="flex-1 bg-gray-100 dark:bg-[#1c1c1e] hover:bg-gray-200/70 dark:hover:bg-[#252528] rounded-full px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 font-medium transition truncate">
                    Share research, questions, or project updates...
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 flex-shrink-0">
                    <button
                      type="button"
                      className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c1c1e] text-[#0066ff] transition"
                      title="Add Media"
                    >
                      <IoImageOutline className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className={`px-3.5 py-1.5 rounded-xl ${primaryBgClass} text-white font-bold text-xs shadow-xs hover:opacity-90 transition hidden sm:inline-block`}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              {/* Feed Stream Status */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${primaryBgClass}`} />
                  <h3 className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                    Latest Discussions
                  </h3>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">
                  {postData?.length || 0} Discussions
                </span>
              </div>

              {/* Posts Stream */}
              {postData.length === 0 ? (
                <div className="w-full bg-white dark:bg-[#121212] rounded-3xl border border-gray-200/80 dark:border-[#262626] p-8 text-center flex flex-col items-center gap-3 shadow-xs">
                  <div className={`w-14 h-14 rounded-2xl ${isEducation ? "bg-gradient-to-tr from-[#0066ff] to-[#38bdf8]" : "bg-gradient-to-tr from-[#e1306c] to-[#833ab4]"} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                    🎓
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                    No feed posts yet
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[320px] leading-relaxed">
                    Be the first to share an academic insight, project milestone, or question with the community.
                  </p>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    className={`mt-2 px-5 py-2.5 rounded-xl ${primaryBgClass} text-white font-bold text-xs shadow-md hover:scale-105 active:scale-95 transition`}
                  >
                    + Create First Post
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {postData.map((post) => (
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
                  ))}
                </div>
              )}

            </div>

            {/* Right Sidebar Rail */}
            <div className="w-full lg:w-[320px] xl:w-[340px] flex flex-col gap-4 flex-shrink-0">
              
              {/* Current User Card */}
              {userData && (
                <div className="bg-white dark:bg-[#121212] p-4 rounded-3xl border border-gray-200/80 dark:border-[#262626] shadow-xs flex items-center justify-between">
                  <div
                    onClick={() => handleGetProfile(userData.userName)}
                    className="flex items-center gap-3 cursor-pointer group min-w-0"
                  >
                    <img
                      src={userData.profileImage || dp}
                      alt={userData.firstName}
                      className="w-12 h-12 rounded-2xl object-cover border border-gray-200 dark:border-gray-700 group-hover:scale-105 transition flex-shrink-0"
                    />
                    <div className="leading-tight truncate">
                      <p className={`text-xs font-bold text-gray-900 dark:text-white group-hover:${primaryColorClass} transition truncate`}>
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className={`text-[11px] ${primaryColorClass} font-semibold truncate`}>
                        @{userData.userName}
                      </p>
                      {userData.headline && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                          {userData.headline}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/profile")}
                    className={`text-xs font-bold ${primaryColorClass} hover:underline flex-shrink-0 ml-2`}
                  >
                    Profile
                  </button>
                </div>
              )}

              {/* Suggested Connections List */}
              {suggestedUsers && suggestedUsers.length > 0 && (
                <div className="bg-white dark:bg-[#121212] p-4 rounded-3xl border border-gray-200/80 dark:border-[#262626] shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-gray-900 dark:text-white tracking-tight">
                      Suggested Scholars
                    </h4>
                    <button
                      onClick={() => navigate("/network")}
                      className={`text-[11px] font-bold ${primaryColorClass} hover:underline`}
                    >
                      See all
                    </button>
                  </div>

                  <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800/60">
                    {suggestedUsers.slice(0, 4).map((u) => (
                      <div key={u._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                        <div
                          onClick={() => handleGetProfile(u.userName)}
                          className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1 group"
                        >
                          <img
                            src={u.profileImage || dp}
                            alt={u.firstName}
                            className="w-9 h-9 rounded-xl object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0 group-hover:scale-105 transition"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-[#0066ff] transition">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-[10px] text-gray-400 truncate">
                              @{u.userName}
                            </p>
                          </div>
                        </div>

                        <div className="scale-90 origin-right">
                          <ConnectionButton userId={u._id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dedicated Academic Hub Section */}
              <EducationFeatureCards onOpenCreatePost={() => setIsCreateOpen(true)} />

              {/* Explore Academic Domains Shortcut Banner */}
              <div
                onClick={() => navigate("/")}
                className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-3xl p-4 shadow-sm cursor-pointer hover:shadow-md transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-bold">Academic Domains</h4>
                  <p className="text-[11px] text-blue-100">Explore AI, CS, Data Science roadmaps</p>
                </div>
                <IoArrowForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Footer Links */}
              <div className="text-[11px] text-gray-400 dark:text-gray-600 flex flex-col gap-2 px-2 pb-4">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                  <span>About EduConnect</span>
                  <span>•</span>
                  <span>Academic Guidelines</span>
                  <span>•</span>
                  <span>Privacy Policy</span>
                  <span>•</span>
                  <span>Research Hub</span>
                </div>
                <p className="text-[10px] uppercase font-semibold tracking-wider">
                  © 2026 EduConnect Academic Network
                </p>
              </div>

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

      {/* Comments Sheet */}
      {activeCommentPostId && (
        <CommentModal
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}

    </div>
  );
}
