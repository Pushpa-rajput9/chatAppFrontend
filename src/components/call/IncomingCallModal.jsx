import { PhoneOff, Phone, Video } from "lucide-react";
import Avatar from "../ui/Avatar.jsx";
import { useCall } from "../../hooks/useCall.js";

const IncomingCallModal = () => {
  const { callState, callType, otherUser, acceptCall, rejectCall } = useCall();

  if (callState !== "incoming" || !otherUser) return null;

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-8 bg-slate-900/90 backdrop-blur">
      <div className="flex flex-col items-center gap-3">
        <Avatar
          src={otherUser.profilePic}
          name={otherUser.username}
          size="lg"
        />
        <p className="text-xl font-semibold text-white">{otherUser.username}</p>
        <p className="text-sm text-white/70">
          Incoming {callType === "video" ? "video" : "voice"} call...
        </p>
      </div>

      <div className="flex items-center gap-10">
        <button
          onClick={rejectCall}
          className="grid h-16 w-16 place-items-center rounded-full bg-rose-600 text-white shadow-lg transition hover:bg-rose-700"
          aria-label="Decline call"
        >
          <PhoneOff className="h-7 w-7" />
        </button>
        <button
          onClick={acceptCall}
          className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600"
          aria-label="Accept call"
        >
          {callType === "video" ? (
            <Video className="h-7 w-7" />
          ) : (
            <Phone className="h-7 w-7" />
          )}
        </button>
      </div>
    </div>
  );
};

export default IncomingCallModal;
