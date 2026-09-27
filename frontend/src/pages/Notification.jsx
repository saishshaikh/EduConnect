import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { IoTrashOutline, IoHeart, IoChatbubble, IoPersonAdd } from "react-icons/io5";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import CreatePostModal from "../components/CreatePostModal";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/userContext";
import { authDataContext } from "../context/AuthContext";

export default function Notification() {
  const { serverUrl } = useContext(authDataContext);
  const { handleGetProfile } = useContext(userDataContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/notification/get`, {
        withCredentials: true,
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOne = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/notification/deleteone/${id}`, {
        withCredentials: true,
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${serverUrl}/api/notification`, {
        withCredentials: true,
      });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <IoHeart className="w-3.5 h-3.5 text-[#e1306c]" />;
      case "comment":
        return <IoChatbubble className="w-3.5 h-3.5 text-[#0095f6]" />;
      default:
        return <IoPersonAdd className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  const getNotificationText = (type) => {
    switch (type) {
      case "like":
        return "liked your post.";
      case "comment":
        return "commented on your post.";
      case "connectionAccepted":
        return "accepted your connection request.";
      default:
        return "interacted with you.";
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      {/* Sidebar */}
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        <main className="flex-1 max-w-[620px] w-full mx-auto px-4 py-6 pb-20 md:pb-8 flex flex-col gap-4">
          
          {/* Activity Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200/80 dark:border-[#262626]">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Activity
            </h2>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-red-500 hover:text-red-600 transition"
              >
                Clear All
              </button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="py-12 flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="w-48 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="w-24 h-2.5 bg-gray-100 dark:bg-gray-900 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#121212] flex items-center justify-center text-2xl">
                ♡
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                No Activity Yet
              </h3>
              <p className="text-xs text-gray-500 max-w-[240px]">
                When people like or comment on your posts, you'll see them here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 dark:divide-[#1c1c1e]">
              {notifications.map((item) => (
                <div
                  key={item._id}
                  className="py-3 flex items-center justify-between gap-3 group"
                >
                  <div
                    onClick={() => item.relatedUser?.userName && handleGetProfile(item.relatedUser.userName)}
                    className="flex items-center gap-3 cursor-pointer min-w-0"
                  >
                    {/* User Avatar with Action Icon Badge */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.relatedUser?.profileImage || dp}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#121212] border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-xs">
                        {getNotificationIcon(item.type)}
                      </span>
                    </div>

                    {/* Notification Copy */}
                    <div className="text-xs leading-relaxed truncate">
                      <p className="text-gray-900 dark:text-white">
                        <span className="font-bold mr-1">
                          {item.relatedUser?.firstName} {item.relatedUser?.lastName}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {getNotificationText(item.type)}
                        </span>
                      </p>
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">
                        {moment(item.createdAt).fromNow()}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail / Action */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.relatedPost?.image && (
                      <img
                        src={item.relatedPost.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-800"
                      />
                    )}

                    <button
                      onClick={() => handleDeleteOne(item._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition rounded-full hover:bg-gray-100 dark:hover:bg-[#1c1c1e]"
                    >
                      <IoTrashOutline className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>

        <BottomNav onOpenCreatePost={() => setIsCreateOpen(true)} />
      </div>

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

    </div>
  );
}
