import { useEffect, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Avatar from "../ui/Avatar.jsx";
import Spinner from "../ui/Spinner.jsx";
import { usersApi } from "../../api/users.api.js";

const NewChatModal = ({ open, onClose, onSelect }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startingId, setStartingId] = useState(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await usersApi.list(query);
        if (!cancelled) setUsers(res.data.users || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleSelect = async (userId) => {
    try {
      setStartingId(userId);
      await onSelect(userId);
    } finally {
      setStartingId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Start a new chat">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email/phone..."
        className="mb-4 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />

      <div className="max-h-72 overflow-y-auto scrollbar-thin">
        {loading ? (
          <div className="py-8">
            <Spinner label="Searching..." />
          </div>
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No users found.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelect(u.id)}
                disabled={startingId === u.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-slate-50 disabled:opacity-50"
              >
                <Avatar
                  src={u.profilePic}
                  name={u.username}
                  online={u.isOnline}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {u.username}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {u.identifier}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NewChatModal;
