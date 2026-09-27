import React, { useContext, useState, useEffect } from "react";
import { IoAdd, IoClose } from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";

export default function StoriesBar({ connections = [] }) {
  const { userData, handleGetProfile } = useContext(userDataContext);
  const [activeStory, setActiveStory] = useState(null);
  const [viewedStories, setViewedStories] = useState({});
  const [progress, setProgress] = useState(0);

  // Auto progress active story
  useEffect(() => {
    if (!activeStory) return;
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setActiveStory(null);
          return 0;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [activeStory]);

  const handleOpenStory = (storyUser) => {
    setActiveStory(storyUser);
    setViewedStories((prev) => ({ ...prev, [storyUser._id]: true }));
  };

  // Sample stories data based on connected users
  const storyList = connections.length > 0 ? connections : [
    { _id: "sample1", firstName: "Aman", userName: "aman_code", profileImage: "" },
    { _id: "sample2", firstName: "Priya", userName: "priya_dev", profileImage: "" },
    { _id: "sample3", firstName: "Rahul", userName: "rahul_ui", profileImage: "" },
    { _id: "sample4", firstName: "Sneha", userName: "sneha_ai", profileImage: "" },
    { _id: "sample5", firstName: "Karan", userName: "karan_edu", profileImage: "" },
  ];

  return (
    <div className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-[#262626] p-3.5 mb-4 shadow-xs overflow-hidden transition-colors">
      <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
        
        {/* Your Story (Current User) */}
        {userData && (
          <div
            onClick={() => handleGetProfile(userData.userName)}
            className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
          >
            <div className="relative w-[62px] h-[62px]">
              <div className="w-full h-full rounded-full p-[2px] border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-[#e1306c] transition">
                <img
                  src={userData.profileImage || dp}
                  alt="Your story"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#0095f6] text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-white dark:border-[#121212] shadow-sm">
                <IoAdd className="w-3.5 h-3.5" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[64px]">
              Your story
            </span>
          </div>
        )}

        {/* Stories from connections */}
        {storyList.map((user) => {
          const isViewed = viewedStories[user._id];
          return (
            <div
              key={user._id}
              onClick={() => handleOpenStory(user)}
              className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group"
            >
              <div
                className={`w-[62px] h-[62px] rounded-full p-[2.5px] transition-transform duration-150 group-hover:scale-105 ${
                  isViewed ? "story-gradient-viewed" : "story-gradient"
                }`}
              >
                <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-[2px]">
                  <img
                    src={user.profileImage || dp}
                    alt={user.firstName}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[64px]">
                {user.firstName}
              </span>
            </div>
          );
        })}

      </div>

      {/* Story Viewer Modal */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-[380px] h-[80vh] max-h-[640px] bg-gradient-to-br from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4 border border-gray-800">
            
            {/* Story Top Progress Bar */}
            <div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Story User Info */}
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeStory.profileImage || dp}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-white/40"
                  />
                  <div>
                    <p className="text-xs font-bold leading-none">{activeStory.firstName}</p>
                    <p className="text-[10px] text-white/70">Story • Active</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Center Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <div className="w-20 h-20 rounded-full story-gradient p-1 mb-2 animate-pulse">
                <div className="w-full h-full rounded-full bg-black p-1">
                  <img
                    src={activeStory.profileImage || dp}
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-white text-lg font-bold">
                {activeStory.firstName}'s Update
              </h3>
              <p className="text-white/80 text-xs max-w-[260px]">
                Connecting, learning and sharing new knowledge on EduConnect! 🎓✨
              </p>
            </div>

            {/* Bottom Quick Reply */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Reply to ${activeStory.firstName}...`}
                className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-white/50 outline-none focus:border-white/60 transition"
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
