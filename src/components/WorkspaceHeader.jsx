import { useState } from "react";
import { Bell, ChevronDown, LogOut, Users, X } from "lucide-react";
import NotificationSettingsModal from "./NotificationSettingsModal";

const ROLES = ["ADMIN", "MEMBER", "VIEWER"];
const idOf = (value) => String(value?._id || value?.id || value || "");

export default function WorkspaceHeader({
  workspace,
  user,
  onLogout,
  notificationSettings,
  onSaveNotificationSettings,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [teamOpen, setTeamOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleCreateWorkspace = async (event) => {
    event.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      await workspace.createWorkspace(workspaceName.trim());
      setWorkspaceName("");
      setMenuOpen(false);
    } catch (error) {
      setCreateError(
        error.response?.data?.message || "Unable to create the workspace.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <header className="relative z-30 mb-5 flex items-center justify-between gap-3 lg:col-span-12 lg:mb-1">
        <div className="min-w-0">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Workspace
          </p>
          <div className="relative">
            <button
              type="button"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-left shadow-sm hover:border-[#3B66F5]/50 focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
            >
              <span className="max-w-[44vw] truncate text-sm font-semibold text-slate-800 sm:max-w-64">
                {workspace.activeWorkspace.name}
              </span>
              <span className="rounded-full bg-[#EEF3FF] px-2 py-0.5 text-[9px] font-bold tracking-wide text-[#3B66F5]">
                {workspace.role}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Switch workspace
                </p>
                <div className="max-h-48 overflow-y-auto">
                  {workspace.workspaces.map((item) => {
                    const itemId = idOf(item);
                    const itemRole =
                      item.members?.find(
                        (member) =>
                          idOf(member.userId) === String(user.id),
                      )?.role || "";
                    return (
                      <button
                        key={itemId}
                        type="button"
                        onClick={() => {
                          workspace.selectWorkspace(itemId);
                          setMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${
                          itemId === workspace.activeWorkspaceId
                            ? "bg-[#EEF3FF] text-[#3B66F5]"
                            : "text-slate-700"
                        }`}
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="shrink-0 text-[9px] font-bold text-slate-400">
                          {itemRole}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="my-2 border-t border-slate-100" />
                <form onSubmit={handleCreateWorkspace} className="p-2">
                  <label
                    htmlFor="new-workspace-name"
                    className="mb-1.5 block text-xs font-medium text-slate-600"
                  >
                    Create New Workspace
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="new-workspace-name"
                      required
                      maxLength={120}
                      value={workspaceName}
                      onChange={(event) => setWorkspaceName(event.target.value)}
                      placeholder="Workspace name"
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#3B66F5]"
                    />
                    <button
                      type="submit"
                      disabled={creating}
                      className="rounded-lg bg-[#3B66F5] px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {creating ? "..." : "Create"}
                    </button>
                  </div>
                  {createError && (
                    <p role="alert" className="mt-2 text-xs text-rose-600">
                      {createError}
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Alert settings"
            title="Alert settings"
            className="rounded-lg p-2 text-slate-500 hover:bg-[#EEF3FF] hover:text-[#3B66F5] focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
          >
            <Bell className="h-4 w-4" />
          </button>
          {(workspace.role === "OWNER" || workspace.role === "ADMIN") && (
            <button
              type="button"
              onClick={() => setTeamOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team / Invite</span>
              <span className="sm:hidden">Team</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void onLogout()}
            aria-label="Logout"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-[#3B66F5]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      {teamOpen && (
        <WorkspaceTeamModal
          workspace={workspace}
          user={user}
          onClose={() => setTeamOpen(false)}
        />
      )}
      <NotificationSettingsModal
        isOpen={notificationsOpen}
        user={user}
        settings={notificationSettings}
        onSave={onSaveNotificationSettings}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}

function WorkspaceTeamModal({ workspace, user, onClose }) {
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const canManageRoles = workspace.role === "OWNER";

  const handleInvite = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await workspace.inviteMember(email.trim(), inviteRole);
      setEmail("");
      setNotice("Member added to this workspace.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to invite this workspace member.",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleRoleChange = async (memberId, role) => {
    setBusy(true);
    setError("");
    try {
      await workspace.changeMemberRole(memberId, role);
      setNotice("Member role updated.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to update this member's role.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-900/45 sm:items-center sm:p-5"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-dialog-title"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="team-dialog-title" className="text-lg font-bold text-slate-900">
              Team / Invite
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {workspace.activeWorkspace.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close team management"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleInvite} className="mt-5 rounded-xl bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-slate-800">
            Add an existing user
          </p>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
            <input
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Member email"
              className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#3B66F5]"
            />
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value)}
              aria-label="Role for invited member"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[#3B66F5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Working..." : "Invite"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            The user must already have a registered account to be added.
          </p>
        </form>

        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">
            Workspace members
          </h3>
          <ul className="divide-y divide-slate-100">
            {(workspace.activeWorkspace.members || []).map((member) => {
              const memberId = idOf(member.userId);
              const isCurrentUser = memberId === String(user.id);
              return (
                <li
                  key={memberId}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {isCurrentUser
                        ? `${user.name} (you)`
                        : `Member ${memberId.slice(-8)}`}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isCurrentUser ? user.email : memberId}
                    </p>
                  </div>
                  {canManageRoles && member.role !== "OWNER" ? (
                    <select
                      aria-label={`Role for member ${memberId}`}
                      value={member.role}
                      disabled={busy}
                      onChange={(event) =>
                        void handleRoleChange(memberId, event.target.value)
                      }
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 disabled:opacity-50"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                      {member.role}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}
