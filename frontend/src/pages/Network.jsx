import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  IoCheckmarkOutline,
  IoCloseOutline,
  IoChatbubbleEllipsesOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import CreatePostModal from "../components/CreatePostModal";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";

export default function Network() {
  const { userData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("invitations"); // "invitations" | "connections"
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch pending requests
  const handleGetRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/connection/requests`, {
        withCredentials: true,
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConnection = async (requestId) => {
    try {
      await axios.put(
        `${serverUrl}/api/connection/accept/${requestId}`,
        {},
        { withCredentials: true }
      );
      setRequests((prev) => prev.filter((con) => con._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectConnection = async (requestId) => {
    try {
      await axios.put(
        `${serverUrl}/api/connection/reject/${requestId}`,
        {},
        { withCredentials: true }
      );
      setRequests((prev) => prev.filter((con) => con._id !== requestId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleGetRequests();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        <main className="flex-1 max-w-[860px] w-full mx-auto px-4 py-6 pb-20 md:pb-8 flex flex-col gap-6">
          
          {/* Header & Tabs */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-[#262626]">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Network
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connect and collaborate with students & educators
              </p>
            </div>

            <div className="flex bg-gray-100 dark:bg-[#1c1c1e] p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab("invitations")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === "invitations"
                    ? "bg-white dark:bg-[#121212] text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Invitations ({requests.length})
              </button>
            </div>
          </div>

          {/* Invitations List */}
          {activeTab === "invitations" && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-4 bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-[#262626] animate-pulse flex items-center gap-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="w-28 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                        <div className="w-40 h-2 bg-gray-100 dark:bg-gray-900 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="py-20 text-center text-gray-400 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[#121212] flex items-center justify-center text-2xl">
                    <IoPeopleOutline className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    No Pending Invitations
                  </h3>
                  <p className="text-xs text-gray-500 max-w-[260px]">
                    You're all caught up! Explore and connect with new peers.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {requests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 bg-white dark:bg-[#121212] rounded-2xl border border-gray-200/80 dark:border-[#262626] shadow-xs flex items-center justify-between gap-3"
                    >
                      <div
                        onClick={() =>
                          req.sender?.userName && handleGetProfile(req.sender.userName)
                        }
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                      >
                        <img
                          src={req.sender?.profileImage || dp}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {req.sender?.firstName} {req.sender?.lastName}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                            {req.sender?.headline || `@${req.sender?.userName}`}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleAcceptConnection(req._id)}
                          className="px-3 py-1.5 rounded-lg bg-[#0095f6] hover:bg-[#0074cc] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                        >
                          <IoCheckmarkOutline className="w-4 h-4" />
                          <span>Accept</span>
                        </button>

                        <button
                          onClick={() => handleRejectConnection(req._id)}
                          className="p-1.5 rounded-lg bg-gray-100 dark:bg-[#1c1c1e] text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition"
                        >
                          <IoCloseOutline className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
