import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";

/**
 * Click to start recording a voice note, click again to stop. While
 * recording, shows an elapsed timer and a cancel button. On stop, hands
 * the recorded Blob back to onRecorded for the caller to upload+send.
 */
const VoiceRecorderButton = ({ onRecorded, disabled }) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      stopStream();
    },
    [],
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stopStream();
        clearInterval(timerRef.current);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 0 && seconds > 0) {
          onRecorded(blob);
        }
        setSeconds(0);
      };

      recorder.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      alert("Couldn't access your microphone. Check browser permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = () => {
        stopStream();
        setSeconds(0);
      };
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
    setRecording(false);
  };

  const formatSeconds = (s) =>
    `${String(Math.floor(s / 60)).padStart(1, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (recording) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-2">
        <button
          type="button"
          onClick={cancelRecording}
          title="Cancel"
          aria-label="Cancel recording"
        >
          <Trash2 className="h-4 w-4 text-rose-500" />
        </button>
        <span className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
          {formatSeconds(seconds)}
        </span>
        <button
          type="button"
          onClick={stopRecording}
          title="Stop and send"
          aria-label="Stop and send recording"
          className="grid h-7 w-7 place-items-center rounded-full bg-rose-500 text-white"
        >
          <Square className="h-3 w-3" fill="currentColor" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      disabled={disabled}
      title="Record a voice message"
      aria-label="Record a voice message"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
    >
      <Mic className="h-5 w-5" />
    </button>
  );
};

export default VoiceRecorderButton;
