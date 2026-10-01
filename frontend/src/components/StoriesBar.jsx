import React, { useContext, useState } from "react";
import { IoAdd } from "react-icons/io5";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import AddStoryModal from "./AddStoryModal";
import StoryViewerModal from "./StoryViewerModal";

export default function StoriesBar() {
  const { userData, storiesFeed, fetchStoriesFeed } = useContext(userDataContext);

  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [activeViewerUserIndex, setActiveViewerUserIndex] = useState(null);

  // Find if current user has active stories in the feed
  const myStoryGroup = storiesFeed.find(
    (group) => group.user?._id?.toString() === userData?._id?.toString()
  );
  const hasMyStories = Boolean(myStoryGroup && myStoryGroup.stories?.length > 0);

  // Other users in the feed (excluding current user to avoid duplication in list)
  const otherStoriesGroups = storiesFeed.filter(
    (group) => group.user?._id?.toString() !== userData?._id?.toString()
  );

  const handleOpenMyStory = (e) => {
    e.stopPropagation();
    if (hasMyStories) {
      const idx = storiesFeed.findIndex(
        (g) => g.user?._id?.toString() === userData?._id?.toString()
      );
      if (idx !== -1) setActiveViewerUserIndex(idx);
    } else {
      setIsAddStoryOpen(true);
    }
  };

  const handleOpenOtherStory = (userGroup) => {
    const idx = storiesFeed.findIndex(
      (g) => g.user?._id?.toString() === userGroup.user?._id?.toString()
    );
    if (idx !== -1) setActiveViewerUserIndex(idx);
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-[#262626] p-3.5 mb-4 shadow-xs overflow-hidden transition-colors">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          
          {/* 1. CURRENT USER STORY AVATAR */}
          {userData && (
            <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group select-none">
              <div
                className="relative w-[62px] h-[62px]"
                onClick={handleOpenMyStory}
              >
                {/* Ring styling based on active story */}
                <div
                  className={`w-full h-full rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                    hasMyStories ? "story-gradient animate-pulse" : "border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-[#e1306c]"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-[2px] overflow-hidden">
                    <img
                      src={userData.profileImage || dp}
                      alt="Your story"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>

                {/* + Add Story Trigger Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddStoryOpen(true);
                  }}
                  className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-white dark:border-[#121212] shadow-sm hover:scale-110 active:scale-95 transition"
                  title="Add Story"
                >
                  <IoAdd className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[66px]">
                {hasMyStories ? "Your Story" : "Add Story"}
              </span>
            </div>
          )}

          {/* 2. STORIES FROM CONNECTED USERS */}
          {otherStoriesGroups.map((group) => {
            const hasUnviewed = group.hasUnviewed;
            const user = group.user;
            if (!user) return null;

            return (
              <div
                key={user._id}
                onClick={() => handleOpenOtherStory(group)}
                className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 group select-none"
              >
                <div
                  className={`w-[62px] h-[62px] rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-105 ${
                    hasUnviewed ? "story-gradient" : "story-gradient-viewed"
                  }`}
                >
                  <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-[2px] overflow-hidden">
                    <img
                      src={user.profileImage || dp}
                      alt={user.firstName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate max-w-[66px]">
                  {user.firstName}
                </span>
              </div>
            );
          })}

        </div>
      </div>

      {/* Add Story Modal */}
      <AddStoryModal
        isOpen={isAddStoryOpen}
        onClose={() => setIsAddStoryOpen(false)}
        onStoryCreated={() => fetchStoriesFeed()}
      />

      {/* Story Viewer Modal */}
      {activeViewerUserIndex !== null && (
        <StoryViewerModal
          isOpen={activeViewerUserIndex !== null}
          initialUserIndex={activeViewerUserIndex}
          storyFeed={storiesFeed}
          onClose={() => {
            setActiveViewerUserIndex(null);
            fetchStoriesFeed();
          }}
          onStoryDeleted={() => fetchStoriesFeed()}
        />
      )}
    </>
  );
}
