import { useRef, useState } from "react";
import { FileText, Image as ImageIcon, Camera, Mic } from "lucide-react";
import CameraCaptureModal from "./CameraCaptureModal.jsx";

const MENU_ITEMS = [
  {
    key: "document",
    label: "Document",
    icon: FileText,
    color: "text-violet-500",
    accept: "*/*",
  },
  {
    key: "media",
    label: "Photos & videos",
    icon: ImageIcon,
    color: "text-sky-500",
    accept: "image/*,video/*",
  },
  { key: "camera", label: "Camera", icon: Camera, color: "text-rose-500" },
  {
    key: "audio",
    label: "Audio",
    icon: Mic,
    color: "text-orange-500",
    accept: "audio/*",
  },
];

/**
 * The "+" attachment menu. Delegates the actual file picking to hidden
 * <input type="file"> elements (or the in-app camera modal), and hands
 * the chosen File back to onFileSelected for the caller to upload+send.
 */
const AttachmentMenu = ({ onFileSelected, disabled }) => {
  const [open, setOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const pendingAcceptRef = useRef("*/*");

  const handleItemClick = (item) => {
    setOpen(false);
    if (item.key === "camera") {
      setCameraOpen(true);
      return;
    }
    pendingAcceptRef.current = item.accept;
    if (fileInputRef.current) {
      fileInputRef.current.accept = item.accept;
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        title="Attach"
        aria-label="Attach a file"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-800 transition hover:bg-blue-100 disabled:opacity-40"
      >
        <span className="text-xl leading-none">＋</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-12 left-0 z-20 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleItemClick(item)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <CameraCaptureModal
        open={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(file) => onFileSelected(file)}
      />
    </div>
  );
};

export default AttachmentMenu;
