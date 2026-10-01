import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoGridOutline,
  IoPersonOutline,
  IoHeart,
  IoChatbubble,
  IoLocationOutline,
  IoSchoolOutline,
  IoBriefcaseOutline,
  IoChatbubbleEllipsesOutline,
  IoShareSocialOutline,
  IoCheckmark,
  IoClose,
  IoPeopleOutline,
  IoAdd,
  IoGlobeOutline,
  IoCodeSlashOutline,
  IoRibbonOutline,
  IoTrophyOutline,
  IoLanguageOutline,
  IoLogoGithub,
  IoLogoLinkedin,
  IoLogoTwitter,
  IoLogoInstagram,
  IoLogoYoutube,
  IoMailOutline,
  IoCallOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import CreatePostModal from "../components/CreatePostModal";
import EditProfileModal from "../components/EditProfileModal";
import CommentModal from "../components/CommentModal";
import ConnectionButton from "../components/ConnectionButton";
import AddStoryModal from "../components/AddStoryModal";
import StoryViewerModal from "../components/StoryViewerModal";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";

export default function Profile() {
  const {
    userData,
    profileData,
    postData,
    handleGetProfile,
    storiesFeed,
    fetchStoriesFeed,
    fetchUserStories,
  } = useContext(userDataContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "about"
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [copied, setCopied] = useState(false);

  // User stories
  const [userActiveStories, setUserActiveStories] = useState([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const targetUser = profileData?._id ? profileData : userData;
  const isOwnProfile = Boolean(
    userData?._id &&
    targetUser?._id &&
    userData._id.toString() === targetUser._id.toString()
  );

  // Filter posts by active profile user
  const userPosts = (postData || []).filter((p) => {
    const authorId = p.author?._id?.toString() || p.author?.toString();
    const targetId = targetUser?._id?.toString();
    return authorId && targetId && authorId === targetId;
  });

  // Fetch active stories for this specific target user
  const loadUserStories = useCallback(async () => {
    if (!targetUser?._id) return;
    const stories = await fetchUserStories(targetUser._id);
    setUserActiveStories(stories || []);
  }, [targetUser?._id, fetchUserStories]);

  useEffect(() => {
    loadUserStories();
  }, [loadUserStories]);

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format single story feed group for viewer modal
  const activeStoryFeed = userActiveStories.length > 0 ? [{
    user: targetUser,
    stories: userActiveStories,
    hasUnviewed: false,
    isCurrentUser: isOwnProfile
  }] : [];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Nav */}
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        <main className="flex-1 max-w-[960px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-20 md:pb-8 flex flex-col gap-6">
          
          {/* 1. PROFILE COVER BANNER & HEADER CARD */}
          <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-200/80 dark:border-[#262626] overflow-hidden shadow-xs transition-colors">
            
            {/* Banner Cover Image */}
            <div className="relative w-full h-[140px] sm:h-[220px] bg-gradient-to-r from-[#e1306c]/20 via-[#833ab4]/20 to-[#0095f6]/20 overflow-hidden">
              {targetUser?.coverImage ? (
                <img
                  src={targetUser.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#e1306c] via-[#fd1d1d] to-[#833ab4] opacity-25" />
              )}
            </div>

            {/* Profile Info Section */}
            <div className="px-4 sm:px-8 pb-6 relative">
              
              {/* Row 1: Avatar, Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-18 mb-4">
                
                {/* Avatar with Interactive Story Ring */}
                <div className="flex items-end gap-3">
                  <div
                    onClick={() => {
                      if (userActiveStories.length > 0) {
                        setIsViewerOpen(true);
                      } else if (isOwnProfile) {
                        setIsAddStoryOpen(true);
                      }
                    }}
                    className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-full p-[3px] flex-shrink-0 cursor-pointer group select-none ${
                      userActiveStories.length > 0 ? "story-gradient animate-pulse" : "bg-white dark:bg-[#121212] border-4 border-white dark:border-[#121212]"
                    }`}
                    title={userActiveStories.length > 0 ? "View Story" : isOwnProfile ? "Add Story" : ""}
                  >
                    <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-[2px] overflow-hidden">
                      <img
                        src={targetUser?.profileImage || dp}
                        alt={targetUser?.firstName}
                        className="w-full h-full rounded-full object-cover group-hover:scale-105 transition duration-200"
                      />
                    </div>

                    {/* Plus Badge for Owner */}
                    {isOwnProfile && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsAddStoryOpen(true);
                        }}
                        className="absolute bottom-1 right-1 w-6 h-6 bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-white dark:border-[#121212] shadow-md hover:scale-110 active:scale-95 transition"
                        title="Add Story"
                      >
                        <IoAdd className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {userActiveStories.length > 0 && (
                    <span className="mb-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white uppercase tracking-wider shadow-xs">
                      Story
                    </span>
                  )}
                </div>

                {/* Profile Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => setIsEditOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-[#1c1c1e] text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#27272a] transition shadow-xs"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => setIsAddStoryOpen(true)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-xs"
                      >
                        <IoAdd className="w-4 h-4" />
                        <span>Add Story</span>
                      </button>
                      <button
                        onClick={handleShareProfile}
                        className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#1c1c1e] text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#27272a] transition flex items-center gap-1.5"
                      >
                        {copied ? <IoCheckmark className="text-emerald-500 w-4 h-4" /> : <IoShareSocialOutline className="w-4 h-4" />}
                        <span>{copied ? "Copied" : "Share"}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <ConnectionButton userId={targetUser?._id} />
                      <button
                        onClick={() => navigate(`/chat/${targetUser?._id}`)}
                        className="px-4 py-2 rounded-xl bg-[#0095f6] text-white text-xs font-bold hover:bg-[#0074cc] transition flex items-center gap-1.5 shadow-xs"
                      >
                        <IoChatbubbleEllipsesOutline className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Row 2: Name, Username, Pronouns, Tagline */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {targetUser?.firstName} {targetUser?.lastName}
                  </h2>
                  {targetUser?.pronouns && (
                    <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#1c1c1e] px-2 py-0.5 rounded-md">
                      ({targetUser.pronouns})
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold text-[#e1306c]">
                  @{targetUser?.userName || "user"}
                </p>

                {targetUser?.headline && (
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-w-[650px] mt-1">
                    {targetUser.headline}
                  </p>
                )}

                {/* Location, Current Role/Company, Website Meta Row */}
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400 pt-2">
                  {targetUser?.location && (
                    <span className="flex items-center gap-1">
                      <IoLocationOutline className="w-3.5 h-3.5 text-[#e1306c]" />
                      <span>{targetUser.location}</span>
                    </span>
                  )}
                  {targetUser?.currentRole && (
                    <span className="flex items-center gap-1">
                      <IoBriefcaseOutline className="w-3.5 h-3.5 text-[#0095f6]" />
                      <span>{targetUser.currentRole}{targetUser?.currentCompany ? ` at ${targetUser.currentCompany}` : ""}</span>
                    </span>
                  )}
                  {targetUser?.currentSchool && (
                    <span className="flex items-center gap-1">
                      <IoSchoolOutline className="w-3.5 h-3.5 text-amber-500" />
                      <span>{targetUser.currentSchool}</span>
                    </span>
                  )}
                  {targetUser?.website && (
                    <a
                      href={targetUser.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[#0095f6] hover:underline"
                    >
                      <IoGlobeOutline className="w-3.5 h-3.5" />
                      <span>{targetUser.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Row 3: Stats Counters (Posts, Connections, Skills, Projects) */}
              <div className="flex items-center gap-6 sm:gap-8 pt-5 mt-5 border-t border-gray-100 dark:border-[#262626] text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">
                    {userPosts.length}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">posts</span>
                </div>

                <div
                  onClick={() => setIsConnectionsOpen(true)}
                  className="cursor-pointer hover:text-[#e1306c] transition group"
                  title="View Connections"
                >
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5 group-hover:text-[#e1306c]">
                    {targetUser?.connection?.length || 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 group-hover:text-[#e1306c]">
                    connections
                  </span>
                </div>

                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">
                    {targetUser?.skills?.length || 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">skills</span>
                </div>

                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1.5">
                    {targetUser?.projects?.length || 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">projects</span>
                </div>
              </div>

            </div>

          </div>

          {/* 2. TAB NAVIGATION */}
          <div className="flex justify-center border-b border-gray-200/80 dark:border-[#262626] text-xs font-bold tracking-wider">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 py-3 px-8 uppercase border-t-2 transition ${
                activeTab === "posts"
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <IoGridOutline className="w-4 h-4" />
              <span>Posts</span>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-2 py-3 px-8 uppercase border-t-2 transition ${
                activeTab === "about"
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <IoPersonOutline className="w-4 h-4" />
              <span>About & Portfolio</span>
            </button>
          </div>

          {/* 3. TAB CONTENT */}

          {/* TAB 1: POSTS GRID */}
          {activeTab === "posts" && (
            <div>
              {userPosts.length === 0 ? (
                <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-xl">
                    📸
                  </div>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    No Posts Yet
                  </p>
                  {isOwnProfile && (
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white text-xs font-bold shadow-xs hover:opacity-90"
                    >
                      Create First Post
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                  {userPosts.map((post) => {
                    const likeCount = post.like?.length || 0;
                    const commentCount = post.comment?.length || 0;

                    return (
                      <div
                        key={post._id}
                        onClick={() => setActiveCommentPostId(post._id)}
                        className="relative aspect-square bg-gray-100 dark:bg-[#121212] overflow-hidden rounded-2xl cursor-pointer group select-none border border-gray-200/70 dark:border-gray-800"
                      >
                        {post.image ? (
                          <img
                            src={post.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-tr from-gray-100 to-gray-200 dark:from-[#18181b] dark:to-[#27272a] text-gray-800 dark:text-gray-200">
                            <p className="text-xs line-clamp-5 leading-relaxed font-medium">
                              {post.description}
                            </p>
                          </div>
                        )}

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
              )}
            </div>
          )}

          {/* TAB 2: DETAILED ABOUT & PORTFOLIO */}
          {activeTab === "about" && (
            <div className="max-w-[760px] mx-auto w-full flex flex-col gap-5 animate-fadeIn">
              
              {/* 1. About Me Card */}
              {targetUser?.about ? (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <IoPersonOutline className="w-4 h-4 text-[#e1306c]" />
                    About Me
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {targetUser.about}
                  </p>
                </div>
              ) : isOwnProfile ? (
                <div className="bg-white dark:bg-[#121212] border border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-5 text-center flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium">
                    You haven't written an About section yet. Introduce yourself to connections!
                  </p>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-xs font-bold text-[#e1306c] hover:underline"
                  >
                    + Add Bio / About
                  </button>
                </div>
              ) : null}

              {/* 2. Experience Card */}
              {targetUser?.experience?.length > 0 ? (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <IoBriefcaseOutline className="w-4 h-4 text-[#0095f6]" />
                    Work & Professional Experience
                  </h4>
                  <div className="flex flex-col gap-4">
                    {targetUser.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="text-xs pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
                      >
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {exp.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                          {exp.company} {exp.location ? `• ${exp.location}` : ""}
                        </p>
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : isOwnProfile ? (
                <div className="bg-white dark:bg-[#121212] border border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-5 text-center flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium">
                    No work experience listed yet.
                  </p>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-xs font-bold text-[#0095f6] hover:underline"
                  >
                    + Add Experience
                  </button>
                </div>
              ) : null}

              {/* 3. Education Card */}
              {targetUser?.education?.length > 0 ? (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <IoSchoolOutline className="w-4 h-4 text-[#e1306c]" />
                    Education
                  </h4>
                  <div className="flex flex-col gap-4">
                    {targetUser.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="text-xs pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
                      >
                        <p className="font-bold text-gray-900 dark:text-white text-sm">
                          {edu.college || edu.school || "College / University"}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                          {edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""}
                        </p>
                        {(edu.startYear || edu.endYear) && (
                          <p className="text-gray-400 text-[11px] mt-0.5">
                            {edu.startYear} - {edu.current ? "Present" : edu.endYear} {edu.grade ? `• Grade: ${edu.grade}` : ""}
                          </p>
                        )}
                        {edu.description && (
                          <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
                            {edu.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : isOwnProfile ? (
                <div className="bg-white dark:bg-[#121212] border border-dashed border-gray-300 dark:border-gray-800 rounded-3xl p-5 text-center flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium">
                    No education entries added yet.
                  </p>
                  <button
                    onClick={() => setIsEditOpen(true)}
                    className="text-xs font-bold text-[#e1306c] hover:underline"
                  >
                    + Add Education
                  </button>
                </div>
              ) : null}

              {/* 4. Skills & Competencies */}
              {targetUser?.skills?.length > 0 && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <IoCodeSlashOutline className="w-4 h-4 text-emerald-500" />
                    Skills & Competencies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {targetUser.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-[#1c1c1e] text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-200/60 dark:border-gray-800"
                      >
                        #{skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Projects Showcase */}
              {targetUser?.projects?.length > 0 && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <IoCodeSlashOutline className="w-4 h-4 text-[#833ab4]" />
                    Featured Projects
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {targetUser.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-gray-50 dark:bg-[#1c1c1e] border border-gray-200/70 dark:border-gray-800 flex flex-col justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">
                            {proj.title}
                          </p>
                          {proj.description && (
                            <p className="text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">
                              {proj.description}
                            </p>
                          )}
                          {proj.technologies?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {proj.technologies.map((t, tidx) => (
                                <span
                                  key={tidx}
                                  className="px-2 py-0.5 rounded-md bg-gray-200/70 dark:bg-gray-800 text-[10px] text-gray-700 dark:text-gray-300 font-mono"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-gray-200/60 dark:border-gray-800 font-semibold text-[11px]">
                          {proj.projectUrl && (
                            <a
                              href={proj.projectUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#0095f6] hover:underline"
                            >
                              Live Demo ↗
                            </a>
                          )}
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1"
                            >
                              <IoLogoGithub className="w-3.5 h-3.5" />
                              <span>GitHub</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Certifications */}
              {targetUser?.certifications?.length > 0 && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <IoRibbonOutline className="w-4 h-4 text-emerald-500" />
                    Certifications & Licenses
                  </h4>
                  <div className="flex flex-col gap-3">
                    {targetUser.certifications.map((cert, idx) => (
                      <div
                        key={idx}
                        className="text-xs pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {cert.name}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                            {cert.issuingOrganization} {cert.issueDate ? `• Issued ${cert.issueDate}` : ""}
                          </p>
                          {cert.credentialId && (
                            <p className="text-gray-400 text-[10px] mt-0.5 font-mono">
                              Credential ID: {cert.credentialId}
                            </p>
                          )}
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold hover:bg-emerald-500/20 transition flex-shrink-0"
                          >
                            Verify ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Achievements */}
              {targetUser?.achievements?.length > 0 && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <IoTrophyOutline className="w-4 h-4 text-amber-500" />
                    Honors & Achievements
                  </h4>
                  <div className="flex flex-col gap-3 text-xs">
                    {targetUser.achievements.map((ach, idx) => (
                      <div key={idx} className="pb-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {ach.title}
                        </p>
                        <p className="text-gray-500 text-[11px]">
                          {ach.issuer} {ach.date ? `• ${ach.date}` : ""}
                        </p>
                        {ach.description && (
                          <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {ach.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Languages & Interests Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Languages */}
                {targetUser?.languages?.length > 0 && (
                  <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 shadow-xs text-xs">
                    <h4 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <IoLanguageOutline className="w-4 h-4 text-[#0095f6]" />
                      Languages
                    </h4>
                    <div className="flex flex-col gap-2">
                      {targetUser.languages.map((lang, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {lang.language}
                          </span>
                          <span className="text-[11px] font-semibold text-[#0095f6]">
                            {lang.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {targetUser?.interests?.length > 0 && (
                  <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 shadow-xs text-xs">
                    <h4 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <IoHeart className="w-4 h-4 text-[#e1306c]" />
                      Interests
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {targetUser.interests.map((int, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#1c1c1e] text-gray-700 dark:text-gray-300 font-medium text-[11px]"
                        >
                          {int}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* 9. Social & Web Profiles Card */}
              {targetUser?.socialLinks && Object.values(targetUser.socialLinks).some(Boolean) && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <IoGlobeOutline className="w-4 h-4 text-[#833ab4]" />
                    Social & Web Profiles
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {targetUser.socialLinks.github && (
                      <a
                        href={targetUser.socialLinks.github}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1c1c1e] hover:bg-gray-100 dark:hover:bg-[#27272a] transition font-medium"
                      >
                        <IoLogoGithub className="w-5 h-5 text-gray-800 dark:text-white" />
                        <span className="truncate">GitHub</span>
                      </a>
                    )}
                    {targetUser.socialLinks.linkedin && (
                      <a
                        href={targetUser.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1c1c1e] hover:bg-gray-100 dark:hover:bg-[#27272a] transition font-medium text-[#0a66c2]"
                      >
                        <IoLogoLinkedin className="w-5 h-5" />
                        <span className="truncate">LinkedIn</span>
                      </a>
                    )}
                    {targetUser.socialLinks.twitter && (
                      <a
                        href={targetUser.socialLinks.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1c1c1e] hover:bg-gray-100 dark:hover:bg-[#27272a] transition font-medium text-[#1da1f2]"
                      >
                        <IoLogoTwitter className="w-5 h-5" />
                        <span className="truncate">Twitter / X</span>
                      </a>
                    )}
                    {targetUser.socialLinks.instagram && (
                      <a
                        href={targetUser.socialLinks.instagram}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1c1c1e] hover:bg-gray-100 dark:hover:bg-[#27272a] transition font-medium text-[#e1306c]"
                      >
                        <IoLogoInstagram className="w-5 h-5" />
                        <span className="truncate">Instagram</span>
                      </a>
                    )}
                    {targetUser.socialLinks.youtube && (
                      <a
                        href={targetUser.socialLinks.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1c1c1e] hover:bg-gray-100 dark:hover:bg-[#27272a] transition font-medium text-[#ff0000]"
                      >
                        <IoLogoYoutube className="w-5 h-5" />
                        <span className="truncate">YouTube</span>
                      </a>
                    )}
                    {targetUser.socialLinks.website && (
                      <a
                        href={targetUser.socialLinks.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-[#1c1c1e] hover:bg-gray-100 dark:hover:bg-[#27272a] transition font-medium text-emerald-500"
                      >
                        <IoGlobeOutline className="w-5 h-5" />
                        <span className="truncate">Personal Website</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 10. Contact & Privacy Information (If Authorized) */}
              {(targetUser?.email || targetUser?.phone || targetUser?.dob) && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-3xl p-5 sm:p-6 shadow-xs text-xs">
                  <h4 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <IoShieldCheckmarkOutline className="w-4 h-4 text-[#e1306c]" />
                    Contact & Personal Information
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {targetUser.email && (
                      <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                        <IoMailOutline className="w-4 h-4 text-gray-400" />
                        <span>{targetUser.email}</span>
                      </div>
                    )}
                    {targetUser.phone && (
                      <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                        <IoCallOutline className="w-4 h-4 text-gray-400" />
                        <span>{targetUser.phone}</span>
                      </div>
                    )}
                    {targetUser.dob && (
                      <div className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300">
                        <IoCalendarOutline className="w-4 h-4 text-gray-400" />
                        <span>Born: {targetUser.dob}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>

        <BottomNav onOpenCreatePost={() => setIsCreateOpen(true)} />
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      <AddStoryModal
        isOpen={isAddStoryOpen}
        onClose={() => setIsAddStoryOpen(false)}
        onStoryCreated={() => {
          loadUserStories();
          fetchStoriesFeed();
        }}
      />

      {isViewerOpen && activeStoryFeed.length > 0 && (
        <StoryViewerModal
          isOpen={isViewerOpen}
          initialUserIndex={0}
          storyFeed={activeStoryFeed}
          onClose={() => {
            setIsViewerOpen(false);
            loadUserStories();
            fetchStoriesFeed();
          }}
          onStoryDeleted={() => {
            loadUserStories();
            fetchStoriesFeed();
          }}
        />
      )}

      {activeCommentPostId && (
        <CommentModal
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}

      {/* Connections List Modal */}
      {isConnectionsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-3xl w-full max-w-[440px] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <IoPeopleOutline className="w-5 h-5 text-[#e1306c]" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Connections ({targetUser?.connection?.length || 0})
                </h3>
              </div>
              <button
                onClick={() => setIsConnectionsOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1c1c1e] transition"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: List of Connected Users */}
            <div className="p-3 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-1.5">
              {(!targetUser?.connection || targetUser.connection.length === 0) ? (
                <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                  <IoPeopleOutline className="w-8 h-8 text-gray-400" />
                  <p>No connections to show.</p>
                </div>
              ) : (
                targetUser.connection.map((friend) => {
                  const isObject = typeof friend === "object" && friend !== null;
                  const friendId = isObject ? friend._id : friend;
                  const friendName = isObject ? `${friend.firstName} ${friend.lastName}` : "Connected User";
                  const friendUsername = isObject ? friend.userName : "";
                  const friendImage = isObject ? friend.profileImage : "";
                  const friendHeadline = isObject ? friend.headline : "";

                  return (
                    <div
                      key={friendId}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-[#1c1c1e] transition gap-3"
                    >
                      <div
                        onClick={() => {
                          if (friendUsername) {
                            handleGetProfile(friendUsername);
                            setIsConnectionsOpen(false);
                          }
                        }}
                        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                      >
                        <img
                          src={friendImage || dp}
                          alt={friendName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate hover:text-[#e1306c] transition">
                            {friendName}
                          </p>
                          {friendUsername && (
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                              @{friendUsername}
                            </p>
                          )}
                          {friendHeadline && (
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                              {friendHeadline}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            setIsConnectionsOpen(false);
                            navigate(`/chat/${friendId}`);
                          }}
                          className="px-3 py-1 rounded-xl bg-[#0095f6] hover:bg-[#0074cc] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
                        >
                          <IoChatbubbleEllipsesOutline className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
