import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoGridOutline,
  IoBookmarkOutline,
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
} from "react-icons/io5";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import CreatePostModal from "../components/CreatePostModal";
import EditProfileModal from "../components/EditProfileModal";
import CommentModal from "../components/CommentModal";
import ConnectionButton from "../components/ConnectionButton";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";

export default function Profile() {
  const { userData, profileData, postData, handleGetProfile } = useContext(userDataContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("posts"); // "posts" | "about" | "saved"
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [copied, setCopied] = useState(false);

  // Filter posts by active profile user
  const targetUser = profileData?._id ? profileData : userData;
  const isOwnProfile = Boolean(
    userData?._id &&
    targetUser?._id &&
    userData._id.toString() === targetUser._id.toString()
  );

  const userPosts = (postData || []).filter((p) => {
    const authorId = p.author?._id?.toString() || p.author?.toString();
    const targetId = targetUser?._id?.toString();
    return authorId && targetId && authorId === targetId;
  });

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar Nav */}
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        <main className="flex-1 max-w-[940px] w-full mx-auto px-4 py-6 pb-20 md:pb-8 flex flex-col gap-6">
          
          {/* 1. INSTAGRAM PROFILE HEADER */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 pb-6 border-b border-gray-200/80 dark:border-[#262626]">
            
            {/* Avatar with Story Gradient */}
            <div className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-full story-gradient p-[3px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-[2.5px] overflow-hidden">
                <img
                  src={targetUser?.profileImage || dp}
                  alt={targetUser?.firstName}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* Profile Info & Actions */}
            <div className="flex-1 flex flex-col gap-4 text-center sm:text-left">
              
              {/* Row 1: Username & Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {targetUser?.userName || "user"}
                </h2>

                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  {isOwnProfile ? (
                    <>
                      <button
                        onClick={() => setIsEditOpen(true)}
                        className="px-4 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1c1c1e] text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#27272a] transition"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleShareProfile}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-[#1c1c1e] text-xs font-bold text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#27272a] transition flex items-center gap-1"
                      >
                        {copied ? <IoCheckmark className="text-emerald-500" /> : <IoShareSocialOutline />}
                        <span>{copied ? "Copied" : "Share"}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <ConnectionButton userId={targetUser?._id} />
                      <button
                        onClick={() => navigate(`/chat/${targetUser?._id}`)}
                        className="px-4 py-1.5 rounded-lg bg-[#0095f6] text-white text-xs font-bold hover:bg-[#0074cc] transition flex items-center gap-1.5 shadow-xs"
                      >
                        <IoChatbubbleEllipsesOutline className="w-3.5 h-3.5" />
                        Message
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Row 2: Stats (Posts, Connections, Skills) */}
              <div className="flex items-center justify-center sm:justify-start gap-6 sm:gap-8 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1">
                    {userPosts.length}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">posts</span>
                </div>

                <div
                  onClick={() => setIsConnectionsOpen(true)}
                  className="cursor-pointer hover:text-[#e1306c] transition group"
                  title="View Connections"
                >
                  <span className="font-bold text-gray-900 dark:text-white mr-1 group-hover:text-[#e1306c]">
                    {targetUser?.connection?.length || 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 group-hover:text-[#e1306c]">
                    connections
                  </span>
                </div>

                <div>
                  <span className="font-bold text-gray-900 dark:text-white mr-1">
                    {targetUser?.skills?.length || 0}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">skills</span>
                </div>
              </div>

              {/* Row 3: Name & Bio */}
              <div className="text-xs sm:text-sm leading-relaxed max-w-[480px]">
                <p className="font-bold text-gray-900 dark:text-white">
                  {targetUser?.firstName} {targetUser?.lastName}
                </p>
                {targetUser?.headline && (
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">
                    {targetUser.headline}
                  </p>
                )}
                {targetUser?.location && (
                  <p className="text-gray-400 dark:text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-1 text-xs">
                    <IoLocationOutline className="w-3.5 h-3.5" />
                    {targetUser.location}
                  </p>
                )}
              </div>

              {/* Skills Chips (Instagram story highlights style) */}
              {targetUser?.skills?.length > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-1.5 flex-wrap pt-1">
                  {targetUser.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-gray-100 dark:bg-[#1c1c1e] text-[11px] font-medium text-gray-800 dark:text-gray-200 rounded-full"
                    >
                      #{skill}
                    </span>
                  ))}
                </div>
              )}

            </div>
          </div>

          {/* 2. TAB NAVIGATION */}
          <div className="flex justify-center border-b border-gray-200/80 dark:border-[#262626] text-xs font-bold tracking-wider">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 py-3 px-6 uppercase border-t-2 transition ${
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
              className={`flex items-center gap-2 py-3 px-6 uppercase border-t-2 transition ${
                activeTab === "about"
                  ? "border-black dark:border-white text-black dark:text-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <IoPersonOutline className="w-4 h-4" />
              <span>About</span>
            </button>
          </div>

          {/* 3. TAB CONTENT */}
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
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 sm:gap-4">
                  {userPosts.map((post) => {
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

          {activeTab === "about" && (
            <div className="max-w-[620px] mx-auto w-full flex flex-col gap-4">
              {/* Education Card */}
              {targetUser?.education?.length > 0 && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-2xl p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <IoSchoolOutline className="w-4 h-4 text-[#e1306c]" />
                    Education
                  </h4>
                  <div className="flex flex-col gap-3">
                    {targetUser.education.map((edu, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {edu.college || "College / University"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Card */}
              {targetUser?.experience?.length > 0 && (
                <div className="bg-white dark:bg-[#121212] border border-gray-200/80 dark:border-[#262626] rounded-2xl p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <IoBriefcaseOutline className="w-4 h-4 text-[#0095f6]" />
                    Experience
                  </h4>
                  <div className="flex flex-col gap-3">
                    {targetUser.experience.map((exp, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {exp.title}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400">
                          {exp.company}
                        </p>
                        {exp.description && (
                          <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
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

      {activeCommentPostId && (
        <CommentModal
          postId={activeCommentPostId}
          onClose={() => setActiveCommentPostId(null)}
        />
      )}

      {/* Connections List Modal */}
      {isConnectionsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl w-full max-w-[440px] max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#262626]">
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
            <div className="p-3 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-2">
              {(!targetUser?.connection || targetUser.connection.length === 0) ? (
                <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                  <IoPeopleOutline className="w-8 h-8 text-gray-400" />
                  <p>No connections to show.</p>
                </div>
              ) : (
                targetUser.connection.map((friend) => {
                  // friend could be populated object or id
                  const isObject = typeof friend === "object" && friend !== null;
                  const friendId = isObject ? friend._id : friend;
                  const friendName = isObject ? `${friend.firstName} ${friend.lastName}` : "Connected User";
                  const friendUsername = isObject ? friend.userName : "";
                  const friendImage = isObject ? friend.profileImage : "";
                  const friendHeadline = isObject ? friend.headline : "";

                  return (
                    <div
                      key={friendId}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1c1c1e] transition gap-3"
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
                          className="px-3 py-1 rounded-lg bg-[#0095f6] hover:bg-[#0074cc] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
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
