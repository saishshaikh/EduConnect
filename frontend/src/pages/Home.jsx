import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import CreatePostModal from "../components/CreatePostModal";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import EducationHeroPoster from "../components/EducationHeroPoster";
import EducationStatsSection from "../components/EducationStatsSection";
import EducationDiscoverySection from "../components/EducationDiscoverySection";
import EducationCategoriesSection from "../components/EducationCategoriesSection";
import {
  IoReaderOutline,
  IoArrowForward,
  IoChatbubblesOutline,
  IoSparkles,
} from "react-icons/io5";

export default function Home() {
  const { userData, postData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [allCommunityUsers, setAllCommunityUsers] = useState([]);

  const discoveryRef = useRef(null);

  // Fetch registered community users for discovery & stats
  useEffect(() => {
    const fetchCommunityUsers = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/search`, {
          withCredentials: true,
        });
        const list = (res.data || []).filter((u) => u._id !== userData?._id);
        setAllCommunityUsers(list);
      } catch (err) {
        console.error("Error fetching community users:", err);
        setAllCommunityUsers([]);
      }
    };

    if (userData?._id) {
      fetchCommunityUsers();
    }
  }, [userData?._id, serverUrl]);

  const scrollToDiscovery = () => {
    if (discoveryRef.current) {
      discoveryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const primaryBgClass = isEducation ? "bg-[#0066ff]" : "bg-[#e1306c]";

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* 1. Desktop Sidebar Navigation */}
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        {/* Academic Home Experience */}
        <main className="flex-1 max-w-[1240px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-8">
          
          {/* A. HERO POSTER (Theme Aware: Pink in Dark/Light, Blue in Education) */}
          <EducationHeroPoster
            onOpenCreatePost={() => setIsCreateOpen(true)}
            onScrollToDiscovery={scrollToDiscovery}
          />

          {/* B. LIVE STATISTICS BAR */}
          <EducationStatsSection totalUsersCount={allCommunityUsers.length} />

          {/* C. ACADEMIC DOMAINS DEEP DIVE (Full Width 4-Column Grid) */}
          <EducationCategoriesSection
            onSelectCategory={(catTitle) => {
              navigate("/explore");
            }}
          />

          {/* D. DISCOVER PEOPLE & MENTORS (Full Width 3-Column Grid) */}
          <div ref={discoveryRef}>
            <EducationDiscoverySection users={allCommunityUsers} id="discovery" />
          </div>

          {/* E. COMMUNITY FEED CALLOUT BANNER */}
          <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col gap-2 max-w-xl z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold w-fit">
                <IoSparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Live Academic Community</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                Engage in Student & Faculty Discussions
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Check out active project updates, coursework questions, study notes, and research breakthroughs on the dedicated User Feed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 z-10">
              <button
                type="button"
                onClick={() => navigate("/feed")}
                className="px-6 py-3 rounded-2xl bg-white text-gray-900 font-black text-xs sm:text-sm shadow-lg hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer"
              >
                <IoReaderOutline className="w-4 h-4 text-[#0066ff]" />
                <span>Open User Feed</span>
                <IoArrowForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <IoChatbubblesOutline className="w-4 h-4" />
                <span>Post Discussion</span>
              </button>
            </div>
          </div>

        </main>

        {/* 3. Global Platform Footer */}
        <Footer />

        {/* 4. Mobile Bottom Navigation */}
        <BottomNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

    </div>
  );
}
