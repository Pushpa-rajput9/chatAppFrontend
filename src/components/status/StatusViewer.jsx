import { useEffect, useRef, useState } from "react";
import Avatar from "../ui/Avatar.jsx";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl.js";
import { formatMessageTime } from "../../utils/formatTime.js";

const SLIDE_DURATION_MS = 5000;

/**
 * Tap-to-advance story viewer for one author's group of statuses.
 * onAdvanceGroup(direction) lets the caller move to the previous/next author.
 */
const StatusViewer = ({ group, onClose, onViewed, onAdvanceGroup }) => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const current = group?.statuses[index];

  useEffect(() => {
    if (!current) return;
    onViewed(current._id);
    setProgress(0);
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION_MS) * 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?._id]);

  const goNext = () => {
    if (index < group.statuses.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onAdvanceGroup(1);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
    } else {
      onAdvanceGroup(-1);
    }
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black">
      <div className="relative flex h-full w-full max-w-md flex-col">
        <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 px-2 pt-2">
          {group.statuses.map((s, i) => (
            <div
              key={s._id}
              className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white"
                style={{
                  width: `${i < index ? 100 : i === index ? progress : 0}%`,
                }}
              />
            </div>
          ))}
        </div>

        <div className="absolute left-0 right-0 top-4 z-10 flex items-center justify-between px-3 pt-2">
          <div className="flex items-center gap-2">
            <Avatar
              src={group.user.profilePic}
              name={group.user.username}
              size="sm"
            />
            <div>
              <p className="text-sm font-semibold text-white">
                {group.user.username}
              </p>
              <p className="text-xs text-white/70">
                {formatMessageTime(current.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-hidden">
          {current.mediaUrl ? (
            current.mediaType === "video" ? (
              <video
                src={resolveMediaUrl(current.mediaUrl)}
                autoPlay
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <img
                src={resolveMediaUrl(current.mediaUrl)}
                alt="Status"
                className="max-h-full max-w-full object-contain"
              />
            )
          ) : (
            <div
              className="flex h-full w-full items-center justify-center p-8 text-center text-2xl font-semibold text-white"
              style={{ backgroundColor: current.backgroundColor || "#3757ee" }}
            >
              {current.text}
            </div>
          )}
          {current.mediaUrl && current.text && (
            <p className="absolute bottom-8 left-0 right-0 px-6 text-center text-sm text-white drop-shadow">
              {current.text}
            </p>
          )}
        </div>

        <button
          onClick={goPrev}
          className="absolute left-0 top-0 h-full w-1/3"
          aria-label="Previous status"
        />
        <button
          onClick={goNext}
          className="absolute right-0 top-0 h-full w-1/3"
          aria-label="Next status"
        />
      </div>
    </div>
  );
};

export default StatusViewer;
