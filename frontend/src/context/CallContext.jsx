import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { userDataContext } from "./UserContext";
import { authDataContext } from "./AuthContext";
import { SocketContext } from "./SocketContext";

export const CallContext = createContext();

export const CallProvider = ({ children }) => {
  const { userData } = useContext(userDataContext);
  const { serverUrl } = useContext(authDataContext);
  const { socket } = useContext(SocketContext);

  // Call States: 'idle' | 'calling' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'rejected' | 'busy'
  const [callState, setCallState] = useState("idle");
  const [callType, setCallType] = useState("voice"); // 'voice' | 'video'
  const [callId, setCallId] = useState(null);
  const [activeCallUser, setActiveCallUser] = useState(null); // The other party
  const [incomingCall, setIncomingCall] = useState(null); // { callId, caller, callType, conversationId }
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [facingMode, setFacingMode] = useState("user"); // 'user' | 'environment'
  const [callError, setCallError] = useState("");

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const durationTimerRef = useRef(null);
  const ringtoneOscillatorsRef = useRef([]);

  const [iceServers, setIceServers] = useState([
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ]);

  // Fetch ICE servers from backend configuration
  useEffect(() => {
    if (userData?._id) {
      axios
        .get(`${serverUrl}/api/call/config`, { withCredentials: true })
        .then((res) => {
          if (res.data?.iceServers?.length) {
            setIceServers(res.data.iceServers);
          }
        })
        .catch(() => {});
    }
  }, [userData?._id, serverUrl]);

  // Ringtone synthesizer (Web Audio API)
  const startRingtone = (type = "incoming") => {
    stopRingtone();
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.connect(audioCtx.destination);

      let isPlaying = true;

      const playTone = () => {
        if (!isPlaying) return;
        const osc = audioCtx.createOscillator();
        osc.type = "sine";

        if (type === "incoming") {
          // Melodic ringtone
          osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
          osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
        } else {
          // Outgoing calling beep
          osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        }

        osc.connect(gainNode);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.45);

        setTimeout(() => {
          if (isPlaying) playTone();
        }, type === "incoming" ? 1800 : 2500);
      };

      playTone();

      ringtoneOscillatorsRef.current = {
        stop: () => {
          isPlaying = false;
          try {
            audioCtx.close();
          } catch {}
        },
      };
    } catch {}
  };

  const stopRingtone = () => {
    if (ringtoneOscillatorsRef.current?.stop) {
      ringtoneOscillatorsRef.current.stop();
      ringtoneOscillatorsRef.current = null;
    }
  };

  // Clean all media streams and WebRTC peer connection
  const cleanupMediaAndPeer = () => {
    stopRingtone();

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    remoteStreamRef.current = null;
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);
  };

  // Create RTCPeerConnection with event handlers
  const createPeerConnection = (targetUserId, currentCallId) => {
    const pc = new RTCPeerConnection({ iceServers });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("webrtc_ice_candidate", {
          callId: currentCallId,
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
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

    peerConnectionRef.current = pc;
    return pc;
  };

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
      // Acquire real user microphone / camera
      const constraints = {
        audio: true,
        video: type === "video" ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      socket.emit("call_initiate", {
        receiverId: targetUser._id,
        callType: type,
        conversationId,
      });
    } catch (err) {
      console.error("Media permission error:", err);
      stopRingtone();
      setCallState("idle");
      setCallError(
        type === "video"
          ? "Camera/Microphone permission is required for video calls."
          : "Microphone permission is required for voice calls."
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

      const pc = createPeerConnection(currentIncoming.caller._id, currentIncoming.callId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      socket.emit("call_accept", { callId: currentIncoming.callId });

      // Start duration counter
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Accept call media error:", err);
      setCallError("Could not access media devices.");
      rejectCall();
    }
  };

  // 3. Reject Call
  const rejectCall = () => {
    stopRingtone();
    if (incomingCall && socket) {
      socket.emit("call_reject", { callId: incomingCall.callId });
      setIncomingCall(null);
    }
    cleanupMediaAndPeer();
    setCallState("idle");
  };

  // 4. Cancel Call (Caller cancels before answered)
  const cancelCall = () => {
    stopRingtone();
    if (callId && socket) {
      socket.emit("call_cancel", { callId });
    }
    cleanupMediaAndPeer();
    setCallState("idle");
    setActiveCallUser(null);
  };

  // 5. End Call (Active call)
  const endCall = () => {
    stopRingtone();
    if (callId && socket) {
      socket.emit("call_end", { callId, duration: callDuration });
    }
    cleanupMediaAndPeer();
    setCallState("idle");
    setActiveCallUser(null);
    setCallId(null);
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

  // 8. Switch Front/Rear Camera on Mobile
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

    // Incoming Call
    const handleCallIncoming = (data) => {
      if (callState !== "idle") {
        socket.emit("call_reject", { callId: data.callId });
        return;
      }
      setIncomingCall(data);
      startRingtone("incoming");
    };

    // Caller: Receiver Ringing
    const handleCallRinging = ({ callId: cId }) => {
      setCallId(cId);
      setCallState("ringing");
    };

    // Caller: Receiver Accepted -> Send WebRTC Offer
    const handleCallAccepted = async ({ callId: cId, receiverId }) => {
      stopRingtone();
      setCallId(cId);
      setCallState("connecting");

      if (!localStreamRef.current) return;

      const pc = createPeerConnection(receiverId, cId);
      localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("webrtc_offer", {
          callId: cId,
          targetUserId: receiverId,
          sdp: offer,
        });

        // Start duration counter on caller side
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
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    };

    // Handle ICE Candidate
    const handleWebRtcCandidate = async ({ candidate }) => {
      if (peerConnectionRef.current && candidate) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      }
    };

    // Call End / Rejected / Cancelled / Busy / Timeout
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
  }, [socket, callState, callId, iceServers]);

  // 9. Toggle Speaker / Loudspeaker
  const toggleSpeaker = (audioElements = []) => {
    setIsSpeakerOn((prev) => {
      const next = !prev;
      audioElements.forEach((el) => {
        if (el) {
          el.muted = !next;
          el.volume = next ? 1.0 : 0.0;
        }
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
    setCallError,
    localStream: localStreamRef.current,
    remoteStream: remoteStreamRef.current,
    localStreamRef,
    remoteStreamRef,
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
