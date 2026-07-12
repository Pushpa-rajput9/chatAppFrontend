import { useEffect, useRef, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";

/**
 * Opens the device camera via getUserMedia, lets the user snap a still
 * photo, and returns it as a File (image/jpeg) through onCapture.
 */
const CameraCaptureModal = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState("");
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [capturedBlob, setCapturedBlob] = useState(null);

  useEffect(() => {
    if (!open) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCapturedUrl(null);
      setCapturedBlob(null);
      setError("");
      return;
    }

    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() =>
        setError("Couldn't access your camera. Check browser permissions."),
      );

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [open]);

  const handleSnap = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        setCapturedUrl(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleRetake = () => {
    setCapturedUrl(null);
    setCapturedBlob(null);
  };

  const handleSend = () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], `photo-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    onCapture(file);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Take a photo">
      {error ? (
        <p className="py-6 text-center text-sm text-rose-500">{error}</p>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl bg-slate-900">
            {capturedUrl ? (
              <img
                src={capturedUrl}
                alt="Captured"
                className="max-h-80 w-full object-contain"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-h-80 w-full -scale-x-100 object-contain"
              />
            )}
          </div>
          <div className="flex justify-center gap-3">
            {capturedUrl ? (
              <>
                <Button
                  variant="outline"
                  className="px-3 py-2 border-2 border-blue-500"
                  onClick={handleRetake}
                >
                  Retake
                </Button>
                <Button onClick={handleSend}>Send photo</Button>
              </>
            ) : (
              <Button onClick={handleSnap}>📸 Capture</Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CameraCaptureModal;
