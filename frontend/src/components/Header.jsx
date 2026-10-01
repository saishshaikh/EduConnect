import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHeartOutline,
  IoHeart,
  IoPaperPlaneOutline,
  IoAddCircleOutline,
  IoSearchOutline,
  IoMenu,
  IoClose,
} from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { ThemeContext } from "../context/ThemeContext";
import ThemeSwitcher from "./ThemeSwitcher";
import MobileDrawer from "./MobileDrawer";
import axios from "axios";

export default function Header({ onOpenCreatePost }) {
  const { userData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { unreadTotal } = useContext(SocketContext);
  const { isEducation } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchData, setSearchData] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  const handleSearch = async (queryVal = searchInput) => {
    try {
      setIsSearching(true);
      const queryParam = queryVal.trim() ? `?query=${encodeURIComponent(queryVal.trim())}` : "";
      const result = await axios.get(
        `${serverUrl}/api/user/search${queryParam}`,
        { withCredentials: true }
      );
      const list = (result.data || []).filter((u) => u._id !== userData?._id);
      setSearchData(list);
      setShowSearchDropdown(true);
    } catch {
      setSearchData([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchInput);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-[58px] sm:h-[62px] bg-white/95 dark:bg-[#000000]/95 backdrop-blur-md border-b border-gray-200/80 dark:border-[#262626] transition-colors duration-200">
        <div className="max-w-[1240px] h-full mx-auto px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Mobile Hamburger Menu & Brand Logo */}
          <div className="flex items-center gap-2">
            
            {/* Hamburger Button for Mobile Drawer */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden p-1.5 -ml-1 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl active:scale-90 transition"
              aria-label="Open Sidebar Menu"
              title="Menu"
            >
              <IoMenu className="w-6 h-6" />
            </button>

            {/* Brand Logo */}
            <div
              onClick={() => navigate("/")}
              className="cursor-pointer flex items-center gap-1.5 group select-none"
            >
              {isEducation ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#0066ff] to-[#38bdf8] flex items-center justify-center text-white font-black text-sm sm:text-base shadow-sm">
                    🎓
                  </div>
                  <span className="text-[19px] sm:text-[22px] font-black tracking-tight text-[#0f172a] dark:text-white group-hover:text-[#0066ff] transition">
                    Edu<span className="text-[#0066ff]">Connect</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-[20px] sm:text-[23px] font-black tracking-tight bg-gradient-to-r from-[#e1306c] via-[#fd1d1d] to-[#833ab4] bg-clip-text text-transparent group-hover:opacity-90 transition">
                    EduConnect
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e1306c] mb-1.5 animate-pulse" />
                </div>
              )}
            </div>

          </div>

          {/* Center: Search Bar (Tablet & Desktop) */}
          <div ref={searchContainerRef} className="hidden sm:flex relative flex-1 max-w-[280px] lg:max-w-[340px]">
            <div className="w-full h-[38px] bg-gray-100 dark:bg-[#1c1c1e] rounded-xl flex items-center px-3 gap-2 text-gray-500 dark:text-gray-400 focus-within:ring-2 focus-within:ring-[#0066ff]/30 dark:focus-within:ring-[#e1306c]/40 transition border border-transparent">
              <IoSearchOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search students, professors, skills..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => {
                  setShowSearchDropdown(true);
                  handleSearch(searchInput);
                }}
                className="w-full bg-transparent outline-none text-[13px] text-gray-800 dark:text-gray-200 placeholder-gray-400 font-medium"
              />
              {isSearching && (
                <div className="w-3.5 h-3.5 border-2 border-[#0066ff] border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute top-[46px] left-0 w-full bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#262626] rounded-2xl shadow-2xl p-2 max-h-[360px] overflow-y-auto custom-scrollbar z-50 animate-slideUp">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 mb-1">
                  {searchInput.trim() ? "Search Results" : "Suggested in Community"}
                </div>
                {searchData.length > 0 ? (
                  searchData.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        handleGetProfile(user.userName);
                        setShowSearchDropdown(false);
                        setSearchInput("");
                      }}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1c1c1e] cursor-pointer transition"
                    >
                      <img
                        src={user.profileImage || dp}
                        alt={user.firstName}
                        className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[12px] text-gray-500 dark:text-gray-400 truncate">
                          @{user.userName}
                        </p>
                        {user.headline && (
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {user.headline}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : !isSearching ? (
                  <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400">
                    {searchInput.trim() ? (
                      <>No users found for "<span className="font-semibold text-gray-700 dark:text-gray-300">{searchInput}</span>"</>
                    ) : (
                      "No other users found."
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Mobile Search Trigger Icon */}
            <button
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              title="Search"
              className="sm:hidden p-2 text-gray-800 dark:text-gray-200 hover:text-[#0066ff] active:scale-90 transition"
            >
              <IoSearchOutline className="w-[22px] h-[22px]" />
            </button>

            {/* Create Post Button (+) */}
            {onOpenCreatePost && (
              <button
                onClick={onOpenCreatePost}
                title="Create Post"
                className="p-1.5 text-gray-800 dark:text-gray-200 hover:text-[#0066ff] dark:hover:text-[#e1306c] hover:scale-110 active:scale-95 transition"
              >
                <IoAddCircleOutline className="w-[24px] h-[24px] sm:w-[26px] sm:h-[26px]" />
              </button>
            )}

            {/* Notifications / Activity Heart */}
            <button
              onClick={() => navigate("/notification")}
              title="Notifications"
              className="p-1.5 text-gray-800 dark:text-gray-200 hover:text-[#0066ff] dark:hover:text-[#e1306c] hover:scale-110 active:scale-95 transition relative"
            >
              {location.pathname === "/notification" ? (
                <IoHeart className="w-[23px] h-[23px] sm:w-[25px] sm:h-[25px] text-[#e1306c]" />
              ) : (
                <IoHeartOutline className="w-[23px] h-[23px] sm:w-[25px] sm:h-[25px]" />
              )}
            </button>

            {/* Direct Messages Icon */}
            <button
              onClick={() => navigate("/chat")}
              title="Messages"
              className="p-1.5 text-gray-800 dark:text-gray-200 hover:text-[#0066ff] dark:hover:text-[#e1306c] hover:scale-110 active:scale-95 transition relative"
            >
              <IoPaperPlaneOutline className="w-[21px] h-[21px] sm:w-[23px] sm:h-[23px]" />
              {unreadTotal > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] bg-[#0066ff] text-white text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 ring-2 ring-white dark:ring-black">
                  {unreadTotal > 9 ? "9+" : unreadTotal}
                </span>
              )}
            </button>

            {/* Theme Switcher Dropdown */}
            <ThemeSwitcher compact={true} />

            {/* User Profile Avatar */}
            {userData && (
              <div
                onClick={() => handleGetProfile(userData.userName)}
                className="cursor-pointer relative flex-shrink-0"
                title="Your Profile"
              >
                <img
                  src={userData.profileImage || dp}
                  alt={userData.firstName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700 hover:border-[#0066ff] transition"
                />
              </div>
            )}

          </div>

        </div>

        {/* Mobile Search Dropdown Bar */}
        {isMobileSearchOpen && (
          <div className="sm:hidden px-3 py-2 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 flex flex-col gap-2 animate-slideDown">
            <div className="w-full h-[36px] bg-gray-100 dark:bg-[#1c1c1e] rounded-xl flex items-center px-3 gap-2 text-gray-500 dark:text-gray-400">
              <IoSearchOutline className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search students, skills, topics..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full bg-transparent outline-none text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400 font-medium"
              />
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <IoClose className="w-4 h-4" />
              </button>
            </div>

            {searchData.length > 0 && (
              <div className="max-h-[240px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {searchData.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => {
                      handleGetProfile(user.userName);
                      setIsMobileSearchOpen(false);
                      setSearchInput("");
                    }}
                    className="flex items-center gap-2.5 py-2 cursor-pointer"
                  >
                    <img
                      src={user.profileImage || dp}
                      alt={user.firstName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        @{user.userName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Mobile Slide-Out Navigation Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenCreatePost={onOpenCreatePost}
      />
    </>
  );
}
