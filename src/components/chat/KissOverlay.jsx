import { useEffect } from "react";
import Avatar from "../ui/Avatar.jsx";
import { playKissSound } from "../../utils/playKissSound.js";

const FLOATING_HEARTS = Array.from({ length: 6 });

/**
 * Plays a couple of seconds of a "kiss" animation - two avatars sliding
 * together with a heart burst - then auto-dismisses via onDone.
 */
const KissOverlay = ({ visible, fromUser, toUser, onDone }) => {
  useEffect(() => {
    if (!visible) return undefined;
    playKissSound();
    const timer = setTimeout(() => onDone?.(), 2600);
    return () => clearTimeout(timer);
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-6 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative flex items-center gap-6">
        {FLOATING_HEARTS.map((_, i) => (
          <span
            key={i}
            className="kiss-floating-heart absolute bottom-0 text-xl"
            style={{ left: `${-10 + i * 18}%`, animationDelay: `${i * 0.15}s` }}
          >
            💗
          </span>
        ))}

        <div className="kiss-slide-left">
          <Avatar
            src={fromUser?.profilePic}
            name={fromUser?.username}
            size="lg"
          />
        </div>
        <div className="kiss-heart-pop text-4xl">💋</div>
        <div className="kiss-slide-right">
          <Avatar src={toUser?.profilePic} name={toUser?.username} size="lg" />
        </div>
      </div>

      <p className="text-base font-semibold text-white drop-shadow">
        {fromUser?.username ? `${fromUser.username} sent a kiss` : "Kiss sent"}{" "}
        😘
      </p>
    </div>
  );
};

export default KissOverlay;
