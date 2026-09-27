import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import {
  IoSearchOutline,
  IoSend,
  IoArrowBack,
  IoCheckmark,
  IoCheckmarkDone,
  IoCameraOutline,
  IoClose,
  IoCall,
  IoVideocam,
} from "react-icons/io5";
import { MdCallEnd, MdCallMissed, MdCallReceived } from "react-icons/md";
import { BsChatDots, BsFillCircleFill } from "react-icons/bs";
import Header from "../components/Header";
import SidebarNav from "../components/SidebarNav";
import BottomNav from "../components/BottomNav";
import CreatePostModal from "../components/CreatePostModal";
import CameraModal from "../components/CameraModal";
import TypingIndicator from "../components/TypingIndicator";
import dp from "../assets/dp.webp";
import { userDataContext } from "../context/UserContext";
import { authDataContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { CallContext } from "../context/CallContext";

export default function Chat() {
  const { userData, handleGetProfile } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const {
    socket,
    isUserOnline,
    getPresenceText,
    typingUsers,
    emitTyping,
    emitStopTyping,
    markSocketRead,
    playNotificationSound,
    setActiveConversationId,
  } = useContext(SocketContext);
  const { startCall } = useContext(CallContext);

  const navigate = useNavigate();
  const { targetUserId } = useParams();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewImageModal, setPreviewImageModal] = useState(null); // Fullscreen image preview

  const formatCallDuration = (seconds) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants || !userData?._id) return null;
    return (
      conversation.participants.find((p) => {
        const id = p?._id ? p._id.toString() : p?.toString();
        return id && id !== userData._id.toString();
      }) || conversation.participants[0]
    );
  };

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const fetchConversations = async (targetToSelect = null) => {
    try {
      setLoadingConversations(true);
      const res = await axios.get(`${serverUrl}/api/message/conversations`, {
        withCredentials: true,
      });
      const convList = res.data || [];
      setConversations(convList);

      if (targetToSelect) {
        const found = convList.find((c) => {
          const other = getOtherParticipant(c);
          return (
            other?._id?.toString() === targetToSelect.toString() ||
            c._id?.toString() === targetToSelect.toString()
          );
        });
        if (found) {
          handleSelectConversation(found);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (targetUserId && userData?._id) {
      const initDirectChat = async () => {
        try {
          const res = await axios.post(
            `${serverUrl}/api/message/conversation/${targetUserId}`,
            {},
            { withCredentials: true }
          );
          if (res.data) {
            setSelectedConversation(res.data);
            setShowMobileChat(true);
            fetchConversations(res.data._id);
          }
        } catch (err) {
          console.error("Error creating direct conversation:", err);
        }
      };
      initDirectChat();
    } else {
      fetchConversations();
    }
  }, [targetUserId, userData?._id]);

  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoadingMessages(true);
      const res = await axios.get(`${serverUrl}/api/message/${conversationId}`, {
        withCredentials: true,
      });
      setMessages(res.data || []);
      setTimeout(() => scrollToBottom("auto"), 50);

      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversationId ? { ...c, unreadCount: 0 } : c
        )
      );

      const other = getOtherParticipant(selectedConversation);
      if (other?._id) {
        markSocketRead(conversationId, other._id);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    setShowMobileChat(true);
    setActiveConversationId(conv._id);
    fetchMessages(conv._id);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload) => {
      const { message, conversation } = payload;
      if (!message) return;

      const isForActiveChat =
        selectedConversation &&
        selectedConversation._id?.toString() === message.conversationId?.toString();

      if (isForActiveChat) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);

        if (message.receiver?.toString() === userData?._id?.toString()) {
          axios
            .put(
              `${serverUrl}/api/message/read/${message.conversationId}`,
              {},
              { withCredentials: true }
            )
            .catch(() => {});
          markSocketRead(message.conversationId, message.sender?._id || message.sender);
        }
      } else {
        playNotificationSound();
      }

      setConversations((prev) => {
        const existingIdx = prev.findIndex(
          (c) => c._id?.toString() === message.conversationId?.toString()
        );

        if (existingIdx !== -1) {
          const updated = [...prev];
          const conv = { ...updated[existingIdx] };
          conv.lastMessage = message;
          conv.updatedAt = message.createdAt;
          if (!isForActiveChat && message.receiver?.toString() === userData?._id?.toString()) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
          updated.splice(existingIdx, 1);
          return [conv, ...updated];
        } else if (conversation) {
          const newConv = { ...conversation };
          newConv.lastMessage = message;
          if (!isForActiveChat) {
            newConv.unreadCount = 1;
          }
          return [newConv, ...prev];
        }
        return prev;
      });
    };

    const handleMessageSent = (payload) => {
      const { message } = payload;
      if (!message) return;

      if (
        selectedConversation &&
        selectedConversation._id?.toString() === message.conversationId?.toString()
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);
      }
    };

    const handleMessagesRead = ({ conversationId }) => {
      if (
        selectedConversation &&
        selectedConversation._id?.toString() === conversationId?.toString()
      ) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?.toString() === userData?._id?.toString() ||
            m.sender?._id?.toString() === userData?._id?.toString()
              ? { ...m, isRead: true }
              : m
          )
        );
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, selectedConversation, userData?._id, serverUrl]);

  useEffect(() => {
    return () => setActiveConversationId(null);
  }, []);

  // Send Text Message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || !selectedConversation || sending) return;

    const other = getOtherParticipant(selectedConversation);
    const otherId = other?._id ? other._id.toString() : other?.toString();
    if (!otherId) return;

    const textToSend = trimmed;
    setInputText(""); // Instantly clear input for snappy UI

    try {
      setSending(true);
      emitStopTyping(selectedConversation._id, otherId);

      const res = await axios.post(
        `${serverUrl}/api/message/send`,
        {
          conversationId: selectedConversation._id,
          receiverId: otherId,
          content: textToSend,
        },
        { withCredentials: true }
      );

      if (res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) return prev;
          return [...prev, res.data];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);

        setConversations((prev) => {
          const list = [...prev];
          const idx = list.findIndex((c) => c._id === selectedConversation._id);
          if (idx !== -1) {
            list[idx].lastMessage = res.data;
            list[idx].updatedAt = res.data.createdAt;
            const item = list.splice(idx, 1)[0];
            return [item, ...list];
          }
          return list;
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setInputText(textToSend); // Restore text on failure
    } finally {
      setSending(false);
    }
  };

  // Send Real Camera Captured Photo Message
  const handleSendCameraPhoto = async (photoBlob, captionText) => {
    if (!selectedConversation || !photoBlob) return;
    const other = getOtherParticipant(selectedConversation);
    const otherId = other?._id ? other._id.toString() : other?.toString();
    if (!otherId) return;

    try {
      setSending(true);
      const formData = new FormData();
      formData.append("conversationId", selectedConversation._id);
      formData.append("receiverId", otherId);
      formData.append("content", captionText || "");
      formData.append("image", photoBlob, `camera-${Date.now()}.jpg`);

      const res = await axios.post(`${serverUrl}/api/message/send`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.data._id)) return prev;
          return [...prev, res.data];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);

        setConversations((prev) => {
          const list = [...prev];
          const idx = list.findIndex((c) => c._id === selectedConversation._id);
          if (idx !== -1) {
            list[idx].lastMessage = res.data;
            list[idx].updatedAt = res.data.createdAt;
            const item = list.splice(idx, 1)[0];
            return [item, ...list];
          }
          return list;
        });
      }
    } catch (err) {
      console.error("Error sending camera photo message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputText(val);

    if (selectedConversation) {
      const other = getOtherParticipant(selectedConversation);
      if (other?._id) {
        if (val.trim().length > 0) {
          emitTyping(selectedConversation._id, other._id);
        } else {
          emitStopTyping(selectedConversation._id, other._id);
        }
      }
    }
  };

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => {
      const other = getOtherParticipant(c);
      const name = `${other?.firstName || ""} ${other?.lastName || ""}`.toLowerCase();
      const user = (other?.userName || "").toLowerCase();
      return name.includes(q) || user.includes(q);
    });
  }, [conversations, searchQuery, userData?._id]);

  const activeOtherUser = selectedConversation
    ? getOtherParticipant(selectedConversation)
    : null;

  const isOtherOnline = activeOtherUser
    ? isUserOnline(activeOtherUser._id)
    : false;

  const otherPresenceText = activeOtherUser
    ? getPresenceText(activeOtherUser)
    : "Offline";

  const isOtherTyping =
    selectedConversation &&
    typingUsers[selectedConversation._id]?.isTyping;

  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;

    messages.forEach((msg) => {
      const msgDate = moment(msg.createdAt).format("YYYY-MM-DD");
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        let displayLabel = moment(msg.createdAt).calendar(null, {
          sameDay: "[Today]",
          lastDay: "[Yesterday]",
          lastWeek: "dddd, MMM D",
          sameElse: "MMMM D, YYYY",
        });
        groups.push({ type: "date", label: displayLabel, key: `date-${msgDate}` });
      }
      groups.push({ type: "message", data: msg, key: msg._id || Math.random() });
    });

    return groups;
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] text-gray-900 dark:text-[#f4f4f5] flex flex-col md:flex-row transition-colors duration-200">
      
      <SidebarNav onOpenCreatePost={() => setIsCreateOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header onOpenCreatePost={() => setIsCreateOpen(true)} />

        {/* Main DM Box */}
        <main className="flex-1 max-w-[1050px] w-full mx-auto p-2 sm:p-4 pb-16 md:pb-4 flex overflow-hidden">
          <div className="w-full h-full bg-white dark:bg-[#121212] rounded-3xl border border-gray-200/80 dark:border-[#262626] flex overflow-hidden shadow-xs">
            
            {/* LEFT: Conversation List */}
            <div
              className={`w-full md:w-[320px] lg:w-[360px] h-full flex flex-col border-r border-gray-100 dark:border-[#262626] bg-white dark:bg-[#121212] ${
                showMobileChat ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Messages Header */}
              <div className="p-4 border-b border-gray-100 dark:border-[#262626] flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BsChatDots className="text-[#e1306c]" />
                  Direct
                </h2>
                <span className="text-xs bg-pink-50 dark:bg-pink-950/40 text-[#e1306c] font-bold px-2.5 py-1 rounded-full">
                  {conversations.length}
                </span>
              </div>

              {/* Search */}
              <div className="px-3.5 py-2">
                <div className="w-full h-9 bg-gray-100 dark:bg-[#1c1c1e] rounded-xl flex items-center px-3 gap-2 text-gray-500">
                  <IoSearchOutline className="w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-xs text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-[#1c1c1e] custom-scrollbar">
                {loadingConversations ? (
                  <div className="p-4 flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 items-center animate-pulse">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="w-24 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                          <div className="w-36 h-2.5 bg-gray-100 dark:bg-gray-900 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                    <p className="text-xs font-bold">No messages</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const other = getOtherParticipant(conv);
                    const isOnline = other ? isUserOnline(other._id) : false;
                    const isSelected = selectedConversation?._id === conv._id;
                    const isTyping = typingUsers[conv._id]?.isTyping;
                    const lastMsg = conv.lastMessage;
                    const unreadCount = conv.unreadCount || 0;

                    return (
                      <div
                        key={conv._id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`flex items-center gap-3 p-3.5 cursor-pointer transition ${
                          isSelected
                            ? "bg-gray-100/80 dark:bg-[#1c1c1e]"
                            : "hover:bg-gray-50 dark:hover:bg-[#18181b]"
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={other?.profileImage || dp}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-[#121212] ${
                              isOnline ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {other ? `${other.firstName} ${other.lastName}` : "User"}
                            </h4>
                            {lastMsg && (
                              <span className="text-[10px] text-gray-400 flex-shrink-0">
                                {moment(lastMsg.createdAt).fromNow(true)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <p
                              className={`text-xs truncate ${
                                isTyping
                                  ? "text-[#e1306c] font-bold italic"
                                  : unreadCount > 0
                                  ? "font-bold text-gray-900 dark:text-white"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {isTyping
                                ? "typing..."
                                : lastMsg?.messageType === "call" && lastMsg?.callInfo?.callType
                                ? `${lastMsg?.callInfo?.callType === "video" ? "🎥 Video" : "📞 Voice"} call`
                                : lastMsg?.image
                                ? "📷 Photo"
                                : lastMsg
                                ? lastMsg.content
                                : "Say hello 👋"}
                            </p>

                            {unreadCount > 0 && (
                              <span className="ml-2 w-4 h-4 rounded-full bg-[#e1306c] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT: Active Conversation View */}
            <div
              className={`flex-1 h-full flex-col bg-[#fafafa] dark:bg-[#0d0d0d] ${
                showMobileChat ? "flex" : "hidden md:flex"
              }`}
            >
              {selectedConversation && activeOtherUser ? (
                <>
                  {/* Chat Header with Accurate Presence & Calling Actions */}
                  <div className="h-[60px] px-3 sm:px-4 bg-white dark:bg-[#121212] border-b border-gray-100 dark:border-[#262626] flex items-center justify-between flex-shrink-0 z-10 gap-2">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="md:hidden p-1 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-[#1c1c1e]"
                        aria-label="Back to messages"
                      >
                        <IoArrowBack className="w-5 h-5" />
                      </button>

                      <div
                        onClick={() => handleGetProfile(activeOtherUser.userName)}
                        className="relative cursor-pointer flex-shrink-0"
                      >
                        <img
                          src={activeOtherUser.profileImage || dp}
                          alt=""
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#121212] ${
                            isOtherOnline ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <h3
                          onClick={() => handleGetProfile(activeOtherUser.userName)}
                          className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white hover:text-[#e1306c] cursor-pointer truncate"
                        >
                          {activeOtherUser.firstName} {activeOtherUser.lastName}
                        </h3>
                        
                        {/* Presence Text (Active now / Active 5m ago / Active yesterday) */}
                        <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <BsFillCircleFill
                            className={`w-1.5 h-1.5 ${
                              isOtherOnline ? "text-emerald-500" : "text-gray-400"
                            }`}
                          />
                          <span className="truncate">{otherPresenceText}</span>
                        </p>
                      </div>
                    </div>

                    {/* Chat Header Actions: Voice, Video, Profile */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      {/* Real WebRTC Voice Call */}
                      <button
                        type="button"
                        onClick={() => startCall(activeOtherUser, "voice", selectedConversation._id)}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs border border-emerald-200/50 dark:border-emerald-800/40"
                        title="Start Voice Call"
                        aria-label="Start Voice Call"
                      >
                        <IoCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="hidden sm:inline">Voice</span>
                      </button>

                      {/* Real WebRTC Video Call */}
                      <button
                        type="button"
                        onClick={() => startCall(activeOtherUser, "video", selectedConversation._id)}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 dark:hover:bg-pink-900/50 text-[#e1306c] dark:text-pink-400 font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-2xs border border-pink-200/50 dark:border-pink-800/40"
                        title="Start Video Call"
                        aria-label="Start Video Call"
                      >
                        <IoVideocam className="w-3.5 h-3.5 text-[#e1306c] dark:text-pink-400" />
                        <span className="hidden sm:inline">Video</span>
                      </button>

                      <button
                        onClick={() => handleGetProfile(activeOtherUser.userName)}
                        className="text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#1c1c1e] text-gray-700 dark:text-gray-300 hidden lg:block"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>

                  {/* Messages Scroll Area */}
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar"
                  >
                    {loadingMessages ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#e1306c]" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 gap-2">
                        <div className="w-16 h-16 rounded-full story-gradient p-1 mb-1">
                          <div className="w-full h-full rounded-full bg-white dark:bg-[#121212] p-1 flex items-center justify-center text-2xl">
                            👋
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          Say hi to {activeOtherUser.firstName}!
                        </h4>
                        <p className="text-xs text-gray-500 max-w-[240px]">
                          Connect on coursework, tech, and shared interests.
                        </p>
                      </div>
                    ) : (
                      groupedMessages.map((item) => {
                        if (item.type === "date") {
                          return (
                            <div key={item.key} className="flex justify-center my-2">
                              <span className="bg-gray-200/70 dark:bg-[#1c1c1e] text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full">
                                {item.label}
                              </span>
                            </div>
                          );
                        }

                        const msg = item.data;
                        const isMe =
                          msg.sender?.toString() === userData?._id?.toString() ||
                          msg.sender?._id?.toString() === userData?._id?.toString();

                        // Call History message item in conversation
                        if (msg.messageType === "call" && msg.callInfo?.callType) {
                          const callInfo = msg.callInfo || {};
                          const isVideo = callInfo.callType === "video";
                          const isMissed = callInfo.status === "missed";
                          const isRejected = callInfo.status === "rejected";

                          return (
                            <div key={item.key} className="flex justify-center my-2 w-full">
                              <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white dark:bg-[#1a1a1c] border border-gray-200/70 dark:border-zinc-800/80 shadow-xs text-xs">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isMissed
                                      ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                                      : isRejected
                                      ? "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                                      : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                                  }`}
                                >
                                  {isVideo ? (
                                    <IoVideocam className="w-4 h-4" />
                                  ) : isMissed ? (
                                    <MdCallMissed className="w-4 h-4" />
                                  ) : isRejected ? (
                                    <MdCallEnd className="w-4 h-4" />
                                  ) : (
                                    <MdCallReceived className="w-4 h-4" />
                                  )}
                                </div>

                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold text-gray-900 dark:text-zinc-100">
                                    {isVideo ? "Video call" : "Voice call"}
                                    {isMissed
                                      ? " · Missed"
                                      : isRejected
                                      ? " · Declined"
                                      : callInfo.status === "cancelled"
                                      ? " · Cancelled"
                                      : ` · ${formatCallDuration(callInfo.duration)}`}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    {moment(msg.createdAt).format("h:mm A")}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    startCall(
                                      activeOtherUser,
                                      callInfo.callType || "voice",
                                      selectedConversation._id
                                    )
                                  }
                                  className="ml-2 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-[11px] font-semibold text-gray-700 dark:text-zinc-200 transition cursor-pointer"
                                >
                                  Call back
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={item.key}
                            className={`flex items-end gap-2 ${
                              isMe ? "justify-end" : "justify-start"
                            }`}
                          >
                            {!isMe && (
                              <img
                                src={activeOtherUser.profileImage || dp}
                                alt=""
                                className="w-7 h-7 rounded-full object-cover mb-0.5 flex-shrink-0"
                              />
                            )}

                            <div
                              className={`max-w-[78%] sm:max-w-[65%] rounded-2xl p-2 sm:p-2.5 text-xs shadow-2xs ${
                                isMe
                                  ? "bg-gradient-to-r from-[#e1306c] to-[#833ab4] text-white rounded-br-xs"
                                  : "bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white border border-gray-100 dark:border-[#262626] rounded-bl-xs"
                              }`}
                            >
                              {/* Photo Attachment if present */}
                              {msg.image && (
                                <div
                                  onClick={() => setPreviewImageModal(msg.image)}
                                  className="relative rounded-xl overflow-hidden mb-1.5 cursor-pointer max-h-[260px] bg-black/10"
                                >
                                  <img
                                    src={msg.image}
                                    alt="Shared photo"
                                    className="w-full h-auto max-h-[260px] object-cover hover:scale-102 transition"
                                  />
                                </div>
                              )}

                              {/* Text content if present */}
                              {msg.content && (
                                <p className="whitespace-pre-wrap break-words leading-relaxed px-1">
                                  {msg.content}
                                </p>
                              )}

                              <div
                                className={`flex items-center justify-end gap-1 mt-1 text-[10px] px-1 ${
                                  isMe ? "text-pink-100" : "text-gray-400"
                                }`}
                              >
                                <span>{moment(msg.createdAt).format("h:mm A")}</span>
                                {isMe && (
                                  <span>
                                    {msg.isRead ? (
                                      <IoCheckmarkDone className="w-3.5 h-3.5 text-cyan-200" />
                                    ) : (
                                      <IoCheckmark className="w-3.5 h-3.5" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {/* Snapchat-Style Live Animated Typing Indicator */}
                    {isOtherTyping && (
                      <div className="flex items-end gap-2 justify-start mt-1">
                        <img
                          src={activeOtherUser.profileImage || dp}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover mb-0.5"
                        />
                        <TypingIndicator
                          userName={activeOtherUser.firstName || activeOtherUser.userName}
                        />
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Bar with Camera & Send */}
                  <div className="p-3 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-[#262626] flex-shrink-0">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-2 bg-gray-100 dark:bg-[#1c1c1e] rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#e1306c]"
                    >
                      {/* Real Camera Button */}
                      <button
                        type="button"
                        onClick={() => setIsCameraOpen(true)}
                        title="Take Camera Photo"
                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[#e1306c] dark:hover:text-[#e1306c] transition rounded-full"
                      >
                        <IoCameraOutline className="w-5 h-5" />
                      </button>

                      <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Message..."
                        className="w-full bg-transparent outline-none text-xs text-gray-900 dark:text-white placeholder-gray-400"
                      />

                      <button
                        type="submit"
                        disabled={!inputText.trim() || sending}
                        className={`p-1.5 rounded-full transition ${
                          inputText.trim() && !sending
                            ? "text-[#0095f6] hover:text-[#0074cc]"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <IoSend className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400 gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
                    Your Direct Messages
                  </h3>
                  <p className="text-xs text-gray-500 max-w-[280px]">
                    Send private messages & real camera photos to peers.
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>

        <BottomNav onOpenCreatePost={() => setIsCreateOpen(true)} />
      </div>

      {/* Modals */}
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Real Camera Photo Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onSendPhoto={handleSendCameraPhoto}
      />

      {/* Fullscreen Photo Lightbox Modal */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <button
            onClick={() => setPreviewImageModal(null)}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-white/10"
          >
            <IoClose className="w-6 h-6" />
          </button>
          <img
            src={previewImageModal}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}

    </div>
  );
}
