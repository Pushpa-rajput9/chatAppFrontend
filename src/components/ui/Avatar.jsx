import { getInitials } from "../../utils/getInitials.js";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

/**
 * Circular avatar. Falls back to a colored initials badge when no image
 * is available (or fails to load), and can render an online-status dot.
 */
const Avatar = ({ src, name = "?", size = "md", online, className = "" }) => {
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div className={`relative shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClass} rounded-full object-cover ring-2 ring-white`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`${sizeClass} ${src ? "hidden" : "flex"} items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 font-semibold text-white ring-2 ring-white`}
      >
        {getInitials(name)}
      </div>
      {typeof online === "boolean" && (
        <span
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
            online ? "bg-emerald-500" : "bg-slate-300"
          }`}
        />
      )}
    </div>
  );
};

export default Avatar;
