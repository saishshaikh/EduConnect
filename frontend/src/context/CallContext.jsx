import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { userDataContext } from "./UserContext";
import { authDataContext } from "./AuthContext";
import { SocketContext } from "./SocketContext";

export const CallContext = createContext();

const DEFAULT_ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
  { urls: "stun:stun.services.mozilla.com" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

export const CallProvider = ({ children }) => {
  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { socket } = useContext(SocketContext);

  // Call States: 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'busy'
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState("voice");
  const [callId, setCallId] = useState(null);
  const [activeCallUser, setActiveCallUser] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState("user");
  const [callError, setCallError] = useState("");
  const [remoteStreamState, setRemoteStreamState] = useState(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const durationTimerRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const ringtoneCtxRef = useRef(null);
  const isPlayingRingtoneRef = useRef(false);

  const [iceServers, setIceServers] = useState(DEFAULT_ICE_SERVERS);

  // Fetch ICE servers if backend provides extra TURN/STUN
  useEffect(() => {
    if (userData?._id && serverUrl) {
      axios
        .get(`${serverUrl}/api/call/config`, { withCredentials: true })
        .then((res) => {
          if (res.data?.iceServers?.length) {
            setIceServers([...DEFAULT_ICE_SERVERS, ...res.data.iceServers]);
          }
        })
        .catch(() => {});
    }
  }, [userData?._id, serverUrl]);

  // Audio synthesizer for ringing tones
  const stopRingtone = useCallback(() => {
    isPlayingRingtoneRef.current = false;
    if (ringtoneCtxRef.current) {
      try {
        ringtoneCtxRef.current.close();
      } catch {}
      ringtoneCtxRef.current = null;
    }
  }, []);

  const startRingtone = useCallback((type = "incoming") => {
    stopRingtone();
    isPlayingRingtoneRef.current = true;

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      ringtoneCtxRef.current = audioCtx;

      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.connect(audioCtx.destination);

      const playTone = () => {
        if (!isPlayingRingtoneRef.current || !ringtoneCtxRef.current) return;
        const ctx = ringtoneCtxRef.current;
        if (ctx.state === "suspended") ctx.resume();

        const osc = ctx.createOscillator();
        osc.type = "sine";

        if (type === "incoming") {
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3);
        } else {
          osc.frequency.setValueAtTime(440, ctx.currentTime);
        }

        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);

        setTimeout(() => {
          if (isPlayingRingtoneRef.current) playTone();
        }, type === "incoming" ? 1800 : 2500);
      };

      playTone();
    } catch {}
  }, [stopRingtone]);

  // Cleanup helper
  const cleanupMediaAndPeer = useCallback(() => {
    stopRingtone();
    iceCandidateQueueRef.current = [];

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        peerConnectionRef.current.oniceconnectionstatechange = null;
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }

    remoteStreamRef.current = null;
    setRemoteStreamState(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
  }, [stopRingtone]);

  // Flush queued ICE Candidates once remote description is set
  const processCandidateQueue = useCallback(async (pc) => {
    if (!pc || !pc.remoteDescription) return;
    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("Error adding queued ICE candidate:", e);
      }
    }
  }, []);

  // Create RTCPeerConnection with bulletproof candidate queuing
  const createPeerConnection = useCallback((targetUserId, currentCallId) => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {}
    }

    const pc = new RTCPeerConnection({
      iceServers,
      iceCandidatePoolSize: 10,
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket && targetUserId) {
        socket.emit("webrtc_ice_candidate", {
          callId: currentCallId,
          targetUserId: targetUserId.toString(),
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        setRemoteStreamState(event.streams[0]);
        setCallState("connected");
        stopRingtone();
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallState("connected");
        stopRingtone();
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        if (callState === "connected") {
          endCall();
        }
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "connected" || pc.iceConnectionState === "completed") {
        setCallState("connected");
        stopRingtone();
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [iceServers, socket, callState, stopRingtone]);

  // 1. Start Call (Caller side)
  const startCall = async (targetUser, type = "voice", conversationId) => {
    if (!socket || !targetUser?._id) return;

    cleanupMediaAndPeer();
    setCallError("");
    setCallType(type);
    setActiveCallUser(targetUser);
    setCallState("calling");
    startRingtone("outgoing");

    try {
      const constraints = {
        audio: true,
        video: type === "video" ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      socket.emit("call_initiate", {
        receiverId: targetUser._id.toString(),
        callType: type,
        conversationId,
      });
    } catch (err) {
      console.error("Media permission error:", err);
      stopRingtone();
      setCallState("idle");
      setCallError(
        type === "video"
          ? "Camera/Microphone permission required for video call."
          : "Microphone permission required for voice call."
      );
      cleanupMediaAndPeer();
    }
  };

  // 2. Accept Incoming Call (Receiver side)
  const acceptCall = async () => {
    if (!incomingCall || !socket) return;
    stopRingtone();

    const currentIncoming = incomingCall;
    setIncomingCall(null);
    setCallId(currentIncoming.callId);
    setActiveCallUser(currentIncoming.caller);
    setCallType(currentIncoming.callType);
    setCallState("connecting");

    try {
      const constraints = {
        audio: true,
        video: currentIncoming.callType === "video" ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      const callerId = currentIncoming.caller?._id || currentIncoming.caller;
      const pc = createPeerConnection(callerId, currentIncoming.callId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      socket.emit("call_accept", { callId: currentIncoming.callId });

      if (!durationTimerRef.current) {
        durationTimerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      }
    } catch (err) {
      console.error("Accept call media error:", err);
      setCallError("Could not access camera/microphone.");
      rejectCall();
    }
  };

  // 3. Reject Call
  const rejectCall = () => {
    if (incomingCall && socket) {
      socket.emit("call_reject", { callId: incomingCall.callId });
    }
    stopRingtone();
    setIncomingCall(null);
    cleanupMediaAndPeer();
    setCallState("idle");
  };

  // 4. Cancel Call (Caller cancels before answer)
  const cancelCall = () => {
    if (callId && socket) {
      socket.emit("call_cancel", { callId });
    }
    stopRingtone();
    cleanupMediaAndPeer();
    setCallState("idle");
  };

  // 5. End Call (during active call)
  const endCall = () => {
    if (callId && socket) {
      socket.emit("call_end", { callId, duration: callDuration });
    }
    cleanupMediaAndPeer();
    setCallState("ended");
    setTimeout(() => setCallState("idle"), 1500);
  };

  // 6. Toggle Mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // 7. Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current && callType === "video") {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // 8. Flip Camera
  const flipCamera = async () => {
    if (!localStreamRef.current || callType !== "video" || !peerConnectionRef.current) return;

    const newFacing = facingMode === "user" ? "environment" : "user";
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const senders = peerConnectionRef.current.getSenders();
      const videoSender = senders.find((s) => s.track && s.track.kind === "video");

      if (videoSender) {
        await videoSender.replaceTrack(newVideoTrack);
      }

      const oldVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        localStreamRef.current.removeTrack(oldVideoTrack);
      }
      localStreamRef.current.addTrack(newVideoTrack);

      setFacingMode(newFacing);
    } catch (err) {
      console.error("Camera switch error:", err);
    }
  };

  // Socket Calling Listeners
  useEffect(() => {
    if (!socket) return;

    // Incoming Call Handler
    const handleCallIncoming = (data) => {
      if (callState !== "idle") {
        socket.emit("call_reject", { callId: data.callId });
        return;
      }
      setIncomingCall(data);
      startRingtone("incoming");

      try {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([400, 200, 400, 200, 400, 200, 400]);
        }
      } catch {}

      try {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          const callerName = `${data?.caller?.firstName || ""} ${data?.caller?.lastName || ""}`.trim() || "Someone";
          const callLabel = data?.callType === "video" ? "Incoming Video Call 🎥" : "Incoming Voice Call 📞";
          new Notification(callLabel, {
            body: `${callerName} is calling you on EduConnect`,
            icon: "/pwa-192x192.png",
            tag: `call-${data.callId}`,
            requireInteraction: true,
          });
        }
      } catch {}
    };

    // Caller: Receiver Ringing
    const handleCallRinging = ({ callId: cId }) => {
      setCallId(cId);
      setCallState("ringing");
    };

    // Caller: Receiver Accepted -> Create Offer
    const handleCallAccepted = async ({ callId: cId, receiverId }) => {
      stopRingtone();
      setCallId(cId);
      setCallState("connecting");

      if (!localStreamRef.current) return;

      const pc = createPeerConnection(receiverId, cId);
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: callType === "video",
        });
        await pc.setLocalDescription(offer);

        socket.emit("webrtc_offer", {
          callId: cId,
          targetUserId: receiverId,
          sdp: offer,
        });

        if (!durationTimerRef.current) {
          durationTimerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        }
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    };

    // Receiver: Handle WebRTC Offer -> Create and Send Answer
    const handleWebRtcOffer = async ({ callId: cId, senderId, sdp }) => {
      const pc = peerConnectionRef.current || createPeerConnection(senderId, cId);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        await processCandidateQueue(pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc_answer", {
          callId: cId,
          targetUserId: senderId,
          sdp: answer,
        });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    };

    // Caller: Handle WebRTC Answer
    const handleWebRtcAnswer = async ({ sdp }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
          await processCandidateQueue(peerConnectionRef.current);
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    };

    // Handle ICE Candidate with Queueing
    const handleWebRtcCandidate = async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        const pc = peerConnectionRef.current;
        if (pc.remoteDescription && pc.remoteDescription.type) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("Error adding ICE candidate directly:", err);
          }
        } else {
          iceCandidateQueueRef.current.push(candidate);
        }
      }
    };

    const handleCallEnded = () => {
      cleanupMediaAndPeer();
      setCallState("ended");
      setTimeout(() => setCallState("idle"), 1800);
    };

    const handleCallRejected = () => {
      cleanupMediaAndPeer();
      setCallState("rejected");
      setTimeout(() => setCallState("idle"), 2500);
    };

    const handleCallCancelled = () => {
      stopRingtone();
      setIncomingCall(null);
      cleanupMediaAndPeer();
      setCallState("idle");
    };

    const handleCallBusy = () => {
      stopRingtone();
      cleanupMediaAndPeer();
      setCallState("busy");
      setCallError("User is currently busy on another call.");
      setTimeout(() => setCallState("idle"), 3000);
    };

    const handleCallTimeout = () => {
      stopRingtone();
      cleanupMediaAndPeer();
      setCallState("idle");
      setCallError("No answer from user.");
    };

    const handleCallFailed = ({ message }) => {
      stopRingtone();
      cleanupMediaAndPeer();
      setCallState("idle");
      setCallError(message || "Call failed.");
    };

    socket.on("call_incoming", handleCallIncoming);
    socket.on("call_ringing", handleCallRinging);
    socket.on("call_accepted", handleCallAccepted);
    socket.on("webrtc_offer", handleWebRtcOffer);
    socket.on("webrtc_answer", handleWebRtcAnswer);
    socket.on("webrtc_ice_candidate", handleWebRtcCandidate);
    socket.on("call_ended", handleCallEnded);
    socket.on("call_rejected", handleCallRejected);
    socket.on("call_cancelled", handleCallCancelled);
    socket.on("call_busy", handleCallBusy);
    socket.on("call_timeout", handleCallTimeout);
    socket.on("call_failed", handleCallFailed);

    return () => {
      socket.off("call_incoming", handleCallIncoming);
      socket.off("call_ringing", handleCallRinging);
      socket.off("call_accepted", handleCallAccepted);
      socket.off("webrtc_offer", handleWebRtcOffer);
      socket.off("webrtc_answer", handleWebRtcAnswer);
      socket.off("webrtc_ice_candidate", handleWebRtcCandidate);
      socket.off("call_ended", handleCallEnded);
      socket.off("call_rejected", handleCallRejected);
      socket.off("call_cancelled", handleCallCancelled);
      socket.off("call_busy", handleCallBusy);
      socket.off("call_timeout", handleCallTimeout);
      socket.off("call_failed", handleCallFailed);
    };
  }, [socket, callState, callId, iceServers, createPeerConnection, processCandidateQueue, cleanupMediaAndPeer, startRingtone, stopRingtone, callType]);

  const toggleSpeaker = (audioElements = []) => {
    setIsSpeakerOn((prev) => {
      const next = !prev;
      audioElements.forEach((el) => {
        if (el) el.muted = !next;
      });
      return next;
    });
  };

  const value = {
    callState,
    callType,
    callId,
    activeCallUser,
    incomingCall,
    callDuration,
    isMuted,
    isVideoOff,
    isSpeakerOn,
    facingMode,
    callError,
    localStreamRef,
    remoteStreamRef,
    remoteStreamState,
    startCall,
    acceptCall,
    rejectCall,
    cancelCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    flipCamera,
  };

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export default CallProvider;
