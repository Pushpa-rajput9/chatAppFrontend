import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CallContext } from "./callContext.js";
import { useSocket } from "../hooks/useSocket.js";
import { useAuth } from "../hooks/useAuth.js";

// Public STUN server for NAT traversal in dev/most home networks. A
// production deployment behind stricter NATs/corporate firewalls will
// also need a TURN server (e.g. coturn, or a managed provider) added here.
const ICE_SERVERS = [{ urls: "stun:stun.l.google.com:19302" }];

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [callState, setCallState] = useState("idle"); // idle | outgoing | incoming | connected
  const [callType, setCallType] = useState("audio"); // audio | video
  const [otherUser, setOtherUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState("");

  const pcRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    pendingOfferRef.current = null;
    pendingCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setOtherUser(null);
    setCallState("idle");
    setMuted(false);
    setCameraOff(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  const createPeerConnection = useCallback(
    (targetUserId) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          socket?.emit("call:ice-candidate", {
            toUserId: targetUserId,
            candidate: e.candidate,
          });
        }
      };

      pc.ontrack = (e) => {
        setRemoteStream(e.streams[0]);
      };

      pc.onconnectionstatechange = () => {
        if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          if (callState !== "idle") cleanup();
        }
      };

      pcRef.current = pc;
      return pc;
    },
    [socket, callState, cleanup],
  );

  const getLocalMedia = useCallback(async (type) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video" ? { width: 480, height: 360 } : false,
    });
    setLocalStream(stream);
    return stream;
  }, []);

  /** Caller side: start an outgoing call. */
  const startCall = useCallback(
    async (targetUser, conversationId, type) => {
      try {
        setError("");
        setCallType(type);
        setOtherUser(targetUser);
        setCallState("outgoing");

        const stream = await getLocalMedia(type);
        const pc = createPeerConnection(targetUser.id);
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket?.emit("call:invite", {
          toUserId: targetUser.id,
          conversationId,
          callType: type,
          fromUser: {
            id: user?.id,
            username: user?.username,
            profilePic: user?.profilePic,
          },
          offer,
        });
      } catch (err) {
        setError(err.message || "Couldn't start the call");
        cleanup();
      }
    },
    [getLocalMedia, createPeerConnection, socket, user, cleanup],
  );

  /** Callee side: accept an incoming call. */
  const acceptCall = useCallback(async () => {
    try {
      setError("");
      const stream = await getLocalMedia(callType);
      const pc = createPeerConnection(otherUser.id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(
        new RTCSessionDescription(pendingOfferRef.current),
      );
      for (const candidate of pendingCandidatesRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket?.emit("call:answer", { toUserId: otherUser.id, answer });
      setCallState("connected");
    } catch (err) {
      setError(err.message || "Couldn't join the call");
      cleanup();
    }
  }, [
    getLocalMedia,
    createPeerConnection,
    callType,
    otherUser,
    socket,
    cleanup,
  ]);

  const rejectCall = useCallback(() => {
    if (otherUser) socket?.emit("call:reject", { toUserId: otherUser.id });
    cleanup();
  }, [socket, otherUser, cleanup]);

  const endCall = useCallback(() => {
    if (otherUser) socket?.emit("call:end", { toUserId: otherUser.id });
    cleanup();
  }, [socket, otherUser, cleanup]);

  const toggleMute = useCallback(() => {
    if (!localStream) return;
    const next = !muted;
    localStream.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
  }, [localStream, muted]);

  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const next = !cameraOff;
    localStream.getVideoTracks().forEach((t) => (t.enabled = !next));
    setCameraOff(next);
  }, [localStream, cameraOff]);

  // --- Socket event wiring -------------------------------------------
  useEffect(() => {
    if (!socket) return undefined;

    const handleIncoming = ({
      conversationId,
      callType: incomingType,
      fromUserId,
      fromUser,
      offer,
    }) => {
      if (callState !== "idle") {
        // Already on/starting a call - auto-decline the new one.
        socket.emit("call:reject", { toUserId: fromUserId });
        return;
      }
      pendingOfferRef.current = offer;
      setCallType(incomingType);
      setOtherUser({ id: fromUserId, ...fromUser, conversationId });
      setCallState("incoming");
    };

    const handleAnswered = async ({ answer }) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      for (const candidate of pendingCandidatesRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      }
      pendingCandidatesRef.current = [];
      setCallState("connected");
    };

    const handleIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      if (pcRef.current?.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const handleRejected = () => {
      setError("Call declined");
      cleanup();
    };

    const handleEnded = () => cleanup();

    socket.on("call:incoming", handleIncoming);
    socket.on("call:answered", handleAnswered);
    socket.on("call:ice-candidate", handleIceCandidate);
    socket.on("call:rejected", handleRejected);
    socket.on("call:ended", handleEnded);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:answered", handleAnswered);
      socket.off("call:ice-candidate", handleIceCandidate);
      socket.off("call:rejected", handleRejected);
      socket.off("call:ended", handleEnded);
    };
  }, [socket, callState, cleanup]);

  const value = useMemo(
    () => ({
      callState,
      callType,
      otherUser,
      localStream,
      remoteStream,
      muted,
      cameraOff,
      error,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleCamera,
      clearError: () => setError(""),
    }),
    [
      callState,
      callType,
      otherUser,
      localStream,
      remoteStream,
      muted,
      cameraOff,
      error,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleCamera,
    ],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
