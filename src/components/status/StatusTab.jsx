import { useState } from "react";
import Avatar from "../ui/Avatar.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import Spinner from "../ui/Spinner.jsx";
import StatusComposerModal from "./StatusComposerModal.jsx";
import StatusViewer from "./StatusViewer.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { useStatuses } from "../../hooks/useStatuses.js";

const StatusTab = () => {
  const { user } = useAuth();
  const { groups, loading, postStatus, markViewed } = useStatuses();
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewingIndex, setViewingIndex] = useState(null);

  const myGroup = groups.find((g) => g.user._id === user?.id);
  const otherGroups = groups.filter((g) => g.user._id !== user?.id);
  const orderedGroups = myGroup ? [myGroup, ...otherGroups] : otherGroups;

  const hasUnseen = (group) =>
    group.statuses.some(
      (s) => !s.viewers?.some((v) => (v._id || v) === user?.id),
    );

  const openViewer = (idx) => setViewingIndex(idx);
  const closeViewer = () => setViewingIndex(null);

  const advanceGroup = (direction) => {
    setViewingIndex((prev) => {
      const next = prev + direction;
      if (next < 0 || next >= orderedGroups.length) return null;
      return next;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-4 py-4">
        <h2 className="text-lg font-bold text-slate-800">Status</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        {/* My status entry */}
        <button
          onClick={() => (myGroup ? openViewer(0) : setComposerOpen(true))}
          className="mb-3 flex w-full items-center gap-3 rounded-xl px-2 py-2 hover:bg-slate-50"
        >
          <div className="relative">
            <Avatar src={user?.profilePic} name={user?.username} size="md" />
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-xs text-white ring-2 ring-white">
              +
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-800">My status</p>
            <p className="text-xs text-slate-400">
              {myGroup
                ? `${myGroup.statuses.length} update(s) · tap to view`
                : "Tap to add a status update"}
            </p>
          </div>
        </button>

        {loading ? (
          <div className="py-10">
            <Spinner label="Loading statuses..." />
          </div>
        ) : otherGroups.length === 0 ? (
          <EmptyState
            icon="🕓"
            title="No recent updates"
            description="Statuses from people you chat with will show up here."
          />
        ) : (
          <div className="flex flex-col gap-1">
            <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Recent updates
            </p>
            {otherGroups.map((group) => {
              const idx = orderedGroups.findIndex(
                (g) => g.user._id === group.user._id,
              );
              return (
                <button
                  key={group.user._id}
                  onClick={() => openViewer(idx)}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50"
                >
                  <div
                    className={`rounded-full p-0.5 ${hasUnseen(group) ? "ring-2 ring-brand-500" : "ring-2 ring-slate-200"}`}
                  >
                    <Avatar
                      src={group.user.profilePic}
                      name={group.user.username}
                      size="md"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {group.user.username}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {group.statuses.length} update(s)
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <StatusComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPost={postStatus}
      />

      {viewingIndex !== null && orderedGroups[viewingIndex] && (
        <StatusViewer
          group={orderedGroups[viewingIndex]}
          onClose={closeViewer}
          onViewed={markViewed}
          onAdvanceGroup={advanceGroup}
        />
      )}
    </div>
  );
};

export default StatusTab;
