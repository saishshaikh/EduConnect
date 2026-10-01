import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHome,
  IoHomeOutline,
  IoAddCircleOutline,
  IoHeart,
  IoHeartOutline,
  IoPaperPlane,
  IoPaperPlaneOutline,
  IoLogOutOutline,
  IoReaderOutline,
  IoReader,
} from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { FiCompass } from "react-icons/fi";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { ThemeContext } from "../context/ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";
import axios from "axios";

export default function SidebarNav({ onOpenCreatePost }) {
  const { userData, setUserData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { unreadTotal } = useContext(SocketContext);
  const { isEducation } = useContext(ThemeContext);

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUserData(null);
      navigate("/login");
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUserData(null);
      navigate("/login");
    }
  };

  const navItems = [
    {
      label: "Home",
      path: "/",
      icon: <IoHomeOutline className="w-6 h-6" />,
      activeIcon: <IoHome className="w-6 h-6" />,
    },
    {
      label: "User Feed",
      path: "/feed",
      icon: <IoReaderOutline className="w-6 h-6" />,
      activeIcon: <IoReader className={`w-6 h-6 ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />,
    },
    {
      label: "Explore",
      path: "/explore",
      icon: <FiCompass className="w-6 h-6" />,
      activeIcon: <FiCompass className="w-6 h-6 stroke-[2.5]" />,
    },
    {
      label: "Messages",
      path: "/chat",
      icon: <IoPaperPlaneOutline className="w-6 h-6" />,
      activeIcon: <IoPaperPlane className="w-6 h-6" />,
      badge: unreadTotal,
    },
    {
      label: "Network",
      path: "/network",
      icon: <FaUserGroup className="w-5 h-5 text-gray-700 dark:text-gray-300" />,
      activeIcon: <FaUserGroup className={`w-5 h-5 ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />,
    },
    {
      label: "Notifications",
      path: "/notification",
      icon: <IoHeartOutline className="w-6 h-6" />,
      activeIcon: <IoHeart className={`w-6 h-6 ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-[72px] lg:w-[220px] xl:w-[245px] h-screen sticky top-0 bg-white dark:bg-[#000000] border-r border-gray-200 dark:border-[#262626] p-3 lg:p-4 z-40 transition-all duration-200 select-none">
      
      {/* Top Section */}
      <div className="flex flex-col gap-6">
        
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer flex items-center gap-2 px-2 py-3 group"
        >
          {isEducation ? (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#0066ff] to-[#38bdf8] flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition">
                🎓
              </div>
              <span className="hidden lg:inline text-[22px] font-black tracking-tight text-[#0f172a] group-hover:text-[#0066ff] transition">
                Edu<span className="text-[#0066ff]">Connect</span>
              </span>
            </div>
          ) : (
            <>
              <span className="hidden lg:inline text-[24px] font-black tracking-tight bg-gradient-to-r from-[#e1306c] via-[#fd1d1d] to-[#833ab4] bg-clip-text text-transparent group-hover:opacity-90 transition">
                EduConnect
              </span>
              <div className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fd1d1d] to-[#833ab4] flex items-center justify-center text-white font-black text-xl shadow-md">
                E
              </div>
            </>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-4 px-3 py-3 rounded-2xl transition-all duration-150 text-left relative ${
                  active
                    ? isEducation
                      ? "font-bold text-[#0066ff] bg-blue-50/80 dark:bg-blue-950/40 shadow-xs"
                      : "font-bold text-gray-950 dark:text-white bg-gray-100 dark:bg-[#1c1c1e]"
                    : "font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-[#1c1c1e]/70"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  {active ? item.activeIcon : item.icon}
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] bg-[#0066ff] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-[15px]">{item.label}</span>
              </button>
            );
          })}

          {/* Create Post Button */}
          {onOpenCreatePost && (
            <button
              onClick={onOpenCreatePost}
              className={`flex items-center gap-4 px-3 py-3 rounded-2xl font-medium transition-all text-left ${
                isEducation
                  ? "text-[#0066ff] hover:bg-blue-50"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-[#1c1c1e]/70"
              }`}
            >
              <IoAddCircleOutline className={`w-6 h-6 ${isEducation ? "text-[#0066ff]" : "text-[#e1306c]"}`} />
              <span className="hidden lg:inline text-[15px] font-semibold">
                Create Post
              </span>
            </button>
          )}

          {/* User Profile */}
          {userData && (
            <button
              onClick={() => handleGetProfile(userData.userName)}
              className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all text-left ${
                isActive("/profile")
                  ? isEducation
                    ? "font-bold text-[#0066ff] bg-blue-50"
                    : "font-bold text-gray-950 dark:text-white bg-gray-100 dark:bg-[#1c1c1e]"
                  : "font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-[#1c1c1e]/70"
              }`}
            >
              <img
                src={userData.profileImage || dp}
                alt={userData.firstName}
                className={`w-6 h-6 rounded-full object-cover border ${
                  isActive("/profile")
                    ? isEducation ? "border-[#0066ff]" : "border-black dark:border-white"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              />
              <span className="hidden lg:inline text-[15px] truncate">
                Profile
              </span>
            </button>
          )}

        </nav>

      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col gap-1 pt-4 border-t border-gray-100 dark:border-[#262626]">
        
        {/* Theme Switcher */}
        <ThemeSwitcher compact={false} className="w-full" />

        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition text-left"
        >
          <IoLogOutOutline className="w-5 h-5" />
          <span className="hidden lg:inline text-[14px]">Log Out</span>
        </button>

      </div>

    </aside>
  );
}
