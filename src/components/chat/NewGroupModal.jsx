import { useEffect, useState } from "react";
import Modal from "../ui/Modal.jsx";
import Avatar from "../ui/Avatar.jsx";
import Spinner from "../ui/Spinner.jsx";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { usersApi } from "../../api/users.api.js";

const NewGroupModal = ({ open, onClose, onCreate }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIds([]);
      setGroupName("");
      setError("");
      return;
    }
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

  const toggleUser = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreate = async () => {
    setError("");
    if (!groupName.trim()) {
      setError("Give your group a name");
      return;
    }
    if (selectedIds.length < 2) {
      setError("Pick at least 2 people for a group");
      return;
    }
    try {
      setCreating(true);
      await onCreate(selectedIds, groupName.trim());
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New group"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={creating}>
            Create group ({selectedIds.length})
          </Button>
        </>
      }
    >
      <Input
        label="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="e.g. Weekend Trip"
        className="mb-3"
      />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search people to add..."
        className="mb-3 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />

      {error && <p className="mb-2 text-sm text-rose-500">{error}</p>}

      <div className="max-h-56 overflow-y-auto scrollbar-thin">
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
              <label
                key={u.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(u.id)}
                  onChange={() => toggleUser(u.id)}
                  className="h-4 w-4 accent-brand-600"
                />
                <Avatar src={u.profilePic} name={u.username} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {u.username}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {u.identifier}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NewGroupModal;
