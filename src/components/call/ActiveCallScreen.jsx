import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import { useCall } from "../../hooks/useCall.js";

const useVideoRef = (stream) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream || null;
  }, [stream]);
  return ref;
};

const formatDuration = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const ActiveCallScreen = () => {
  const {
    callState,
    callType,
    otherUser,
    localStream,
    remoteStream,
    muted,
    cameraOff,
    endCall,
    toggleMute,
    toggleCamera,
  } = useCall();

  const localVideoRef = useVideoRef(localStream);
  const remoteVideoRef = useVideoRef(remoteStream);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (callState !== "connected") {
      setSeconds(0);
      return undefined;
    }
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [callState]);

  if (!["outgoing", "connected"].includes(callState) || !otherUser) return null;

  const isVideo = callType === "video";
  const statusLabel =
    callState === "outgoing" ? "Calling..." : formatDuration(seconds);

  return (
    <div className="fixed inset-0 z-[75] flex flex-col bg-slate-950">
      <div className="relative flex-1 overflow-hidden">
        {isVideo ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full bg-slate-900 object-cover"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 h-32 w-24 rounded-xl border-2 border-white/20 bg-slate-800 object-cover shadow-lg"
            />
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Avatar
              src={otherUser.profilePic}
              name={otherUser.username}
              size="lg"
            />
            <audio ref={remoteVideoRef} autoPlay />
          </div>
        )}

        <div className="absolute left-0 right-0 top-6 flex flex-col items-center gap-1 text-white">
          <p className="text-lg font-semibold">{otherUser.username}</p>
          <p className="text-sm text-white/70">{statusLabel}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 bg-slate-900/80 px-6 py-6">
        <button
          onClick={toggleMute}
          className={`grid h-14 w-14 place-items-center rounded-full transition ${
            muted
              ? "bg-white text-slate-900"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>

        {isVideo && (
          <button
            onClick={toggleCamera}
            className={`grid h-14 w-14 place-items-center rounded-full transition ${
              cameraOff
                ? "bg-white text-slate-900"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
            aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
          >
            {cameraOff ? (
              <VideoOff className="h-6 w-6" />
            ) : (
              <Video className="h-6 w-6" />
            )}
          </button>
        )}

        <button
          onClick={endCall}
          className="grid h-14 w-14 place-items-center rounded-full bg-rose-600 text-white transition hover:bg-rose-700"
          aria-label="End call"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default ActiveCallScreen;
