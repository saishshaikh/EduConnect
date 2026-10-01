import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoClose,
  IoHome,
  IoHomeOutline,
  IoReader,
  IoReaderOutline,
  IoPaperPlane,
  IoPaperPlaneOutline,
  IoHeart,
  IoHeartOutline,
  IoAddCircleOutline,
  IoLogOutOutline,
  IoSparkles,
} from "react-icons/io5";
import { FiCompass } from "react-icons/fi";
import { FaUserGroup } from "react-icons/fa6";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { ThemeContext } from "../context/ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";
import axios from "axios";

export default function MobileDrawer({ isOpen, onClose, onOpenCreatePost }) {
  const { userData, setUserData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { unreadTotal } = useContext(SocketContext);
  const { isEducation, theme } = useContext(ThemeContext);

  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const isActive = (path) => location.pathname === path;

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUserData(null);
      onClose();
      navigate("/login");
    }
  };

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: <IoHomeOutline className="w-5 h-5" />,
      activeIcon: <IoHome className="w-5 h-5 text-[#0066ff]" />,
    },
    {
      label: "User Feed",
      path: "/feed",
      icon: <IoReaderOutline className="w-5 h-5" />,
      activeIcon: <IoReader className={`w-5 h-5 ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />,
    },
    {
      label: "Explore",
      path: "/explore",
      icon: <FiCompass className="w-5 h-5" />,
      activeIcon: <FiCompass className={`w-5 h-5 stroke-[2.5] ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />,
    },
    {
      label: "Messages",
      path: "/chat",
      icon: <IoPaperPlaneOutline className="w-5 h-5" />,
      activeIcon: <IoPaperPlane className={`w-5 h-5 ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />,
      badge: unreadTotal,
    },
    {
      label: "Network & Friends",
      path: "/network",
      icon: <FaUserGroup className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
      activeIcon: <FaUserGroup className={`w-5 h-5 ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />,
    },
    {
      label: "Notifications",
      path: "/notification",
      icon: <IoHeartOutline className="w-5 h-5" />,
      activeIcon: <IoHeart className={`w-5 h-5 ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
      {/* Backdrop overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Sidebar Drawer */}
      <div className="relative w-[82%] max-w-[320px] h-full bg-white dark:bg-[#0f0f11] shadow-2xl flex flex-col justify-between border-r border-gray-200 dark:border-gray-800 z-10 animate-slideRight overflow-y-auto">
        
        {/* Top Header & Profile Banner */}
        <div className="flex flex-col">
          
          {/* Drawer Header Bar */}
          <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/80">
            <div
              onClick={() => handleNavigate("/")}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0066ff] to-[#38bdf8] flex items-center justify-center text-white font-black text-base shadow-sm">
                🎓
              </div>
              <span className="text-[19px] font-black tracking-tight text-gray-900 dark:text-white">
                Edu<span className="text-[#0066ff]">Connect</span>
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition active:scale-95"
              aria-label="Close menu"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          {/* User Profile Info Card */}
          {userData && (
            <div
              onClick={() => {
                handleGetProfile(userData.userName);
                onClose();
              }}
              className="p-4 mx-3 my-3 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-gray-900 dark:to-gray-900/60 rounded-2xl border border-blue-100/80 dark:border-gray-800 flex items-center gap-3 cursor-pointer hover:shadow-xs transition"
            >
              <img
                src={userData.profileImage || dp}
                alt={userData.firstName}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white dark:border-gray-700 shadow-xs flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {userData.firstName} {userData.lastName}
                </p>
                <p className="text-xs text-[#0066ff] font-semibold truncate">
                  @{userData.userName}
                </p>
                {userData.headline && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {userData.headline}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Items List */}
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all ${
                    active
                      ? isEducation
                        ? "font-bold text-[#0066ff] bg-blue-50 dark:bg-blue-950/40 shadow-2xs"
                        : "font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {active ? item.activeIcon : item.icon}
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 && (
                    <span className="min-w-[18px] h-[18px] bg-[#0066ff] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Create Post Action */}
            {onOpenCreatePost && (
              <button
                onClick={() => {
                  onClose();
                  onOpenCreatePost();
                }}
                className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-bold text-sm text-[#0066ff] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition text-left"
              >
                <IoAddCircleOutline className="w-5 h-5 text-[#0066ff]" />
                <span>Create New Post</span>
              </button>
            )}
          </nav>

        </div>

        {/* Bottom Section: Theme & Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
          
          {/* Theme Selector */}
          <div className="px-1 py-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-2">
              Appearance & Theme
            </p>
            <ThemeSwitcher compact={false} className="w-full" />
          </div>

          {/* Log Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
          >
            <IoLogOutOutline className="w-5 h-5" />
            <span>Log Out</span>
          </button>

        </div>

      </div>
    </div>
  );
}
