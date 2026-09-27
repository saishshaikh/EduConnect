import React, { useContext, useEffect, useRef, useState } from "react";
import { CallContext } from "../context/CallContext";
import {
  IoCall,
  IoCallOutline,
  IoVideocam,
  IoVideocamOff,
  IoMic,
  IoMicOff,
  IoVolumeHigh,
  IoVolumeMute,
  IoCameraReverseOutline,
  IoExpandOutline,
  IoContractOutline,
  IoClose,
} from "react-icons/io5";
import { MdCallEnd, MdCallMissed } from "react-icons/md";

export const CallModal = () => {
  const {
    callState,
    callType,
    incomingCall,
    activeCallUser,
    callDuration,
    isMuted,
    isVideoOff,
    isSpeakerOn,
    callError,
    localStreamRef,
    remoteStreamRef,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    flipCamera,
  } = useContext(CallContext);

  const localVideoElementRef = useRef(null);
  const remoteVideoElementRef = useRef(null);
  const remoteAudioElementRef = useRef(null);
  const [isPipSmall, setIsPipSmall] = useState(false);

  // Format seconds -> mm:ss
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Attach local and remote media streams to video/audio elements
  useEffect(() => {
    if (callState === "calling" || callState === "ringing" || callState === "connecting" || callState === "connected") {
      const interval = setInterval(() => {
        // Local stream
        if (localVideoElementRef.current && localStreamRef.current) {
          if (localVideoElementRef.current.srcObject !== localStreamRef.current) {
            localVideoElementRef.current.srcObject = localStreamRef.current;
          }
        }
        // Remote stream
        if (remoteStreamRef.current) {
          if (remoteVideoElementRef.current && remoteVideoElementRef.current.srcObject !== remoteStreamRef.current) {
            remoteVideoElementRef.current.srcObject = remoteStreamRef.current;
          }
          if (remoteAudioElementRef.current && remoteAudioElementRef.current.srcObject !== remoteStreamRef.current) {
            remoteAudioElementRef.current.srcObject = remoteStreamRef.current;
          }
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [callState, localStreamRef, remoteStreamRef]);

  // 1. INCOMING CALL OVERLAY
  if (incomingCall) {
    const caller = incomingCall.caller || {};
    const isVideo = incomingCall.callType === "video";

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fadeIn">
        <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 text-center flex flex-col items-center animate-slideUp">
          {/* Pulsing Avatar Container */}
          <div className="relative mb-4 mt-2">
            <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping [animation-duration:2s]" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg bg-slate-100 dark:bg-zinc-800">
              {caller.profileImage ? (
                <img
                  src={caller.profileImage}
                  alt={caller.userName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-3xl text-indigo-600 dark:text-indigo-400">
                  {(caller.firstName?.[0] || caller.userName?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {caller.firstName ? `${caller.firstName} ${caller.lastName || ""}` : caller.userName || "EduConnect User"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">@{caller.userName || "user"}</p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            {isVideo ? <IoVideocam size={14} /> : <IoCall size={14} />}
            <span>Incoming {isVideo ? "Video" : "Voice"} Call...</span>
          </div>

          {/* Accept / Reject Action Buttons */}
          <div className="flex items-center justify-center gap-6 mt-8 w-full">
            {/* Reject Button */}
            <button
              onClick={rejectCall}
              className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
              aria-label="Decline Call"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform duration-200 group-hover:scale-105 active:scale-95">
                <MdCallEnd size={26} />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Decline</span>
            </button>

            {/* Accept Button */}
            <button
              onClick={acceptCall}
              className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
              aria-label="Accept Call"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform duration-200 group-hover:scale-105 active:scale-95 animate-bounce [animation-duration:1.2s]">
                {isVideo ? <IoVideocam size={24} /> : <IoCall size={24} />}
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE / CALLING / RINGING MODAL
  if (
    callState === "calling" ||
    callState === "ringing" ||
    callState === "connecting" ||
    callState === "connected" ||
    callState === "ended" ||
    callState === "rejected" ||
    callState === "busy"
  ) {
    const isVideo = callType === "video";
    const user = activeCallUser || {};

    return (
      <div className="fixed inset-0 z-[9999] flex flex-col bg-zinc-950 text-white select-none overflow-hidden animate-fadeIn">
        {/* Hidden audio element for fallback voice playback */}
        <audio ref={remoteAudioElementRef} autoPlay playsInline />

        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700">
              {user.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-sm text-indigo-400">
                  {(user.firstName?.[0] || user.userName?.[0] || "U").toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm leading-tight text-white">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.userName || "EduConnect User"}
              </h4>
              <p className="text-xs text-zinc-400 capitalize">
                {callState === "connected"
                  ? `${isVideo ? "Video" : "Voice"} Call • ${formatDuration(callDuration)}`
                  : callState === "ringing"
                  ? "Ringing..."
                  : callState === "connecting"
                  ? "Connecting..."
                  : callState === "busy"
                  ? "User is busy"
                  : callState === "rejected"
                  ? "Call declined"
                  : callState === "ended"
                  ? "Call ended"
                  : "Calling..."}
              </p>
            </div>
          </div>

          {callError && (
            <div className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
              {callError}
            </div>
          )}
        </div>

        {/* MAIN BODY AREA */}
        <div className="relative flex-1 flex items-center justify-center w-full h-full bg-zinc-900">
          {isVideo ? (
            /* VIDEO CALL INTERFACE */
            <div className="relative w-full h-full flex items-center justify-center">
              {/* REMOTE VIDEO (Fullscreen background) */}
              <video
                ref={remoteVideoElementRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover bg-zinc-900"
              />

              {/* Placeholder when remote video stream is not yet active or connecting */}
              {callState !== "connected" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-sm z-10">
                  <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/60 shadow-2xl bg-zinc-800 animate-pulse">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-indigo-400">
                          {(user.firstName?.[0] || user.userName?.[0] || "U").toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.userName || "Calling..."}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1 capitalize">{callState}...</p>
                </div>
              )}

              {/* LOCAL PREVIEW PIP (Picture-in-Picture Floating Window) */}
              <div
                className={`absolute bottom-24 right-4 z-20 transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-zinc-800 ${
                  isPipSmall ? "w-24 h-36" : "w-32 h-48 md:w-44 md:h-60"
                }`}
              >
                <video
                  ref={localVideoElementRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoOff ? "hidden" : "block"}`}
                />
                {isVideoOff && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800 text-zinc-400 text-xs">
                    <IoVideocamOff size={22} className="mb-1" />
                    <span>Camera Off</span>
                  </div>
                )}
                <button
                  onClick={() => setIsPipSmall(!isPipSmall)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/80"
                  aria-label="Toggle Picture in Picture size"
                >
                  {isPipSmall ? <IoExpandOutline size={14} /> : <IoContractOutline size={14} />}
                </button>
              </div>
            </div>
          ) : (
            /* VOICE CALL INTERFACE */
            <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm w-full">
              <div className="relative mb-6">
                <div
                  className={`absolute inset-0 rounded-full bg-indigo-500/20 ${
                    callState === "connected" ? "animate-ping [animation-duration:3s]" : "animate-pulse"
                  }`}
                />
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-indigo-500 shadow-2xl bg-zinc-800">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-5xl text-indigo-400">
                      {(user.firstName?.[0] || user.userName?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white">
                {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.userName || "EduConnect User"}
              </h2>
              <p className="text-sm text-zinc-400 mt-1">@{user.userName || "user"}</p>

              <div className="mt-4 px-4 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-indigo-400 text-sm font-semibold tracking-wider">
                {callState === "connected" ? formatDuration(callDuration) : `${callState.toUpperCase()}...`}
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS DOCK */}
        <div className="absolute bottom-0 inset-x-0 z-30 pb-8 pt-4 px-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-center gap-3 sm:gap-5">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isMuted
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                : "bg-zinc-800/90 text-white hover:bg-zinc-700 border border-zinc-700"
            }`}
            aria-label={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <IoMicOff size={22} /> : <IoMic size={22} />}
          </button>

          {/* Speaker / Loudspeaker Toggle Button */}
          <button
            onClick={() =>
              toggleSpeaker([
                remoteAudioElementRef.current,
                remoteVideoElementRef.current,
              ])
            }
            className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isSpeakerOn
                ? "bg-zinc-800/90 text-emerald-400 hover:bg-zinc-700 border border-zinc-700"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
            }`}
            aria-label={isSpeakerOn ? "Turn Speaker Off" : "Turn Speaker On"}
            title={isSpeakerOn ? "Speaker ON" : "Speaker Muted"}
          >
            {isSpeakerOn ? <IoVolumeHigh size={22} /> : <IoVolumeMute size={22} />}
          </button>

          {/* Video Toggle Button (Video call only) */}
          {isVideo && (
            <button
              onClick={toggleVideo}
              className={`w-13 h-13 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                isVideoOff
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-zinc-800/90 text-white hover:bg-zinc-700 border border-zinc-700"
              }`}
              aria-label={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
              title={isVideoOff ? "Turn Camera On" : "Turn Camera Off"}
            >
              {isVideoOff ? <IoVideocamOff size={22} /> : <IoVideocam size={22} />}
            </button>
          )}

          {/* Flip Camera Button (Video call on mobile/touch devices) */}
          {isVideo && (
            <button
              onClick={flipCamera}
              className="w-13 h-13 rounded-full bg-zinc-800/90 text-white hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition-all duration-200 cursor-pointer"
              aria-label="Switch Camera"
              title="Switch Camera (Front/Rear)"
            >
              <IoCameraReverseOutline size={22} />
            </button>
          )}

          {/* End / Cancel Call Button */}
          <button
            onClick={callState === "connected" ? endCall : cancelCall}
            className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="End Call"
            title="End Call"
          >
            <MdCallEnd size={26} />
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default CallModal;
