import { TextInput } from "../../components";
import { Icons, Icon } from "../../components/icons";
import { useTeamInvitePage } from "../../hooks";
import transition from "../../utils/transitions/transition";
import type { ITeamMember, ITeam, ITeamAnnouncement } from "../../interfaces";

// Modal component for creating teams
const CreateTeamModal = ({
  isOpen,
  onClose,
  onSubmit,
  teamName,
  setTeamName,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  teamName: string;
  setTeamName: (name: string) => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary">Create New Team</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary-10 rounded-full transition-colors"
          >
            <Icon name={Icons.Close} size={20} className="text-secondary-50" />
          </button>
        </div>
        <TextInput
          label="Team Name"
          placeholder="Enter a name for your team"
          value={teamName}
          setValue={setTeamName}
        />
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-secondary-25 text-secondary font-medium hover:bg-secondary-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading || !teamName.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Team"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Confirmation modal for destructive actions
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  isLoading?: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <Icon name={Icons.Trash} size={20} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-secondary">{title}</h2>
        </div>
        <p className="text-secondary-50 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-secondary-25 text-secondary font-medium hover:bg-secondary-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal component for creating announcements
const AnnouncementModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  setTitle,
  message,
  setMessage,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  title: string;
  setTitle: (val: string) => void;
  message: string;
  setMessage: (val: string) => void;
  isLoading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
              <span className="text-xl">📢</span>
            </div>
            <h2 className="text-xl font-bold text-secondary">
              New Announcement
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary-10 rounded-full transition-colors"
          >
            <Icon name={Icons.Close} size={20} className="text-secondary-50" />
          </button>
        </div>

        <div className="space-y-4">
          <TextInput
            label="Title"
            placeholder="Announcement title..."
            value={title}
            setValue={setTitle}
          />
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              Message
            </label>
            <textarea
              placeholder="Write your announcement message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-secondary-25 focus:border-accent focus:ring-1 focus:ring-accent outline-none resize-none transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-secondary-25 text-secondary font-medium hover:bg-secondary-10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading || !title.trim() || !message.trim()}
            className="flex-1 py-3 px-4 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Posting..." : "Post Announcement"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get status badge
const getStatusBadge = (status: boolean | null) => {
  if (status === null) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  }
  if (status === true) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Accepted
      </span>
    );
  }
  return (
    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
      Declined
    </span>
  );
};

export const TeamInviteTestPage = transition(() => {
  const {
    user,
    teams,
    selectedTeam,
    invitations,
    announcements,
    loading,
    editMode,
    showCreateModal,
    showDeleteModal,
    showInvitePanel,
    showAnnouncementModal,
    activeTab,
    forms,
    actions,
    controls,
    helpers,
  } = useTeamInvitePage();

  if (!user) {
    return (
      <div className="flex flex-1 justify-center items-center p-10">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-10 rounded-full flex items-center justify-center">
            <Icon name={Icons.Group} size={32} className="text-secondary-50" />
          </div>
          <p className="text-lg font-medium text-secondary mb-2">
            Welcome to Teams
          </p>
          <p className="text-secondary-50">
            Please log in to manage your teams.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden bg-secondary-5">
      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={controls.closeCreateModal}
        onSubmit={actions.onCreateTeam}
        teamName={forms.newTeamName}
        setTeamName={forms.setNewTeamName}
        isLoading={loading.creatingTeam}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={controls.closeDeleteModal}
        onConfirm={actions.onDeleteTeam}
        title="Delete Team"
        message={`Are you sure you want to delete "${selectedTeam?.team_name}"? All members will be removed and this action cannot be undone.`}
        confirmText="Delete Team"
        isLoading={loading.deletingTeam}
      />

      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => controls.setShowAnnouncementModal(false)}
        onSubmit={actions.onPostAnnouncement}
        title={forms.announcementTitle}
        setTitle={forms.setAnnouncementTitle}
        message={forms.announcementMessage}
        setMessage={forms.setAnnouncementMessage}
        isLoading={loading.postingAnnouncement}
      />

      {/* Header */}
      <div className="bg-white border-b border-secondary-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Icon name={Icons.Group} size={24} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">Teams</h1>
              <p className="text-sm text-secondary-50">
                Manage your teams and members
              </p>
            </div>
          </div>
          <button
            onClick={controls.openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-sm"
          >
            <Icon name={Icons.Add} size={20} />
            Create Team
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Teams List */}
        <div className="w-80 bg-white border-r border-secondary-10 flex flex-col">
          <div className="p-4 border-b border-secondary-10">
            <p className="text-sm font-medium text-secondary-50 uppercase tracking-wide">
              My Teams ({teams.length})
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loading.loadingTeams ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-accent border-t-transparent"></div>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 bg-secondary-10 rounded-full flex items-center justify-center">
                  <Icon
                    name={Icons.Group}
                    size={24}
                    className="text-secondary-50"
                  />
                </div>
                <p className="text-sm text-secondary-50 mb-4">No teams yet</p>
                <button
                  onClick={controls.openCreateModal}
                  className="text-sm text-accent font-medium hover:underline"
                >
                  Create your first team
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => {
                  const isSelected = selectedTeam?.team_id === team.team_id;
                  const memberCount = team.members?.length ?? 0;

                  return (
                    <button
                      key={team.team_id}
                      onClick={() => actions.onSelectTeam(team)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        isSelected
                          ? "bg-accent text-white shadow-md"
                          : "bg-secondary-5 hover:bg-secondary-10 text-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-accent/10 text-accent"
                          }`}
                        >
                          {team.team_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {team.team_name}
                          </p>
                          <p
                            className={`text-xs ${isSelected ? "text-white/70" : "text-secondary-50"}`}
                          >
                            {memberCount}{" "}
                            {memberCount === 1 ? "member" : "members"}
                          </p>
                        </div>
                        {helpers.isCurrentUserCreator(team) && (
                          <span
                            className={`text-xs ${isSelected ? "text-white/70" : "text-accent"}`}
                          >
                            👑
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {selectedTeam ? (
          <TeamDetailView
            selectedTeam={selectedTeam}
            invitations={invitations}
            announcements={announcements}
            loading={loading}
            editMode={editMode}
            showInvitePanel={showInvitePanel}
            activeTab={activeTab}
            forms={forms}
            actions={actions}
            controls={controls}
            helpers={helpers}
            user={user}
          />
        ) : (
          /* Empty State - No Team Selected */
          <div className="flex-1 flex items-center justify-center bg-secondary-5">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                <Icon
                  name={Icons.Group}
                  size={40}
                  className="text-secondary-25"
                />
              </div>
              <p className="text-xl font-semibold text-secondary mb-2">
                Select a team
              </p>
              <p className="text-secondary-50 mb-6">
                Choose a team from the sidebar to view details
              </p>
              {teams.length === 0 && (
                <button
                  onClick={controls.openCreateModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors shadow-sm"
                >
                  <Icon name={Icons.Add} size={20} />
                  Create Your First Team
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

// Team Detail View Component
const TeamDetailView = ({
  selectedTeam,
  invitations,
  announcements,
  loading,
  editMode,
  showInvitePanel,
  activeTab,
  forms,
  actions,
  controls,
  helpers,
  user,
}: {
  selectedTeam: ITeam;
  invitations: ReturnType<typeof useTeamInvitePage>["invitations"];
  announcements: ReturnType<typeof useTeamInvitePage>["announcements"];
  loading: ReturnType<typeof useTeamInvitePage>["loading"];
  editMode: boolean;
  showInvitePanel: boolean;
  activeTab: "members" | "invitations" | "announcements";
  forms: ReturnType<typeof useTeamInvitePage>["forms"];
  actions: ReturnType<typeof useTeamInvitePage>["actions"];
  controls: ReturnType<typeof useTeamInvitePage>["controls"];
  helpers: ReturnType<typeof useTeamInvitePage>["helpers"];
  user: NonNullable<ReturnType<typeof useTeamInvitePage>["user"]>;
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Team Header */}
      <div className="bg-white border-b border-secondary-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center font-bold text-accent">
              {selectedTeam.team_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary">
                {selectedTeam.team_name}
              </h2>
              <p className="text-sm text-secondary-50">
                {selectedTeam.members?.length ?? 0} members • Created by{" "}
                {helpers.isCurrentUserCreator(selectedTeam)
                  ? "you"
                  : (() => {
                      const creator = selectedTeam.members?.find(
                        (m: ITeamMember) =>
                          m.user.user_id === selectedTeam.created_by_user_id,
                      );
                      return creator
                        ? helpers.getMemberDisplayName(creator)
                        : "unknown";
                    })()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {helpers.isCurrentUserAdmin(selectedTeam) && (
              <>
                <button
                  onClick={() => controls.setShowAnnouncementModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
                >
                  <Icon name={Icons.Announce} size={18} />
                  Announce
                </button>
                <button
                  onClick={controls.toggleInvitePanel}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    showInvitePanel
                      ? "bg-accent text-white"
                      : "bg-accent/10 text-accent hover:bg-accent/20"
                  }`}
                >
                  <Icon name={Icons.Add} size={18} />
                  Invite
                </button>
              </>
            )}
            {helpers.isCurrentUserCreator(selectedTeam) && (
              <>
                <button
                  onClick={controls.toggleEditMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    editMode
                      ? "bg-secondary text-white"
                      : "bg-secondary-10 text-secondary hover:bg-secondary-25"
                  }`}
                >
                  <Icon name={editMode ? Icons.Check : Icons.Edit} size={18} />
                  {editMode ? "Done" : "Edit"}
                </button>
                {editMode && (
                  <button
                    onClick={controls.openDeleteModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 font-medium hover:bg-red-100 transition-colors"
                  >
                    <Icon name={Icons.Trash} size={18} />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Invite Panel - Expandable */}
        {showInvitePanel && (
          <div className="mt-4 p-4 bg-secondary-5 rounded-xl">
            <div className="flex gap-3">
              <div className="flex-1">
                <TextInput
                  label=""
                  placeholder="Enter email address to invite..."
                  value={forms.inviteEmail}
                  setValue={forms.setInviteEmail}
                />
              </div>
              <button
                onClick={actions.onInvite}
                disabled={loading.sendingInvite || !forms.inviteEmail.trim()}
                className="px-6 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-10.5 self-end"
              >
                {loading.sendingInvite ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-secondary-10 px-6">
        <div className="flex gap-6">
          <button
            onClick={() => controls.setActiveTab("members")}
            className={`py-3 border-b-2 font-medium transition-colors ${
              activeTab === "members"
                ? "border-accent text-accent"
                : "border-transparent text-secondary-50 hover:text-secondary"
            }`}
          >
            Members ({selectedTeam.members?.length ?? 0})
          </button>
          <button
            onClick={() => controls.setActiveTab("announcements")}
            className={`py-3 border-b-2 font-medium transition-colors ${
              activeTab === "announcements"
                ? "border-accent text-accent"
                : "border-transparent text-secondary-50 hover:text-secondary"
            }`}
          >
            Announcements ({announcements.length})
          </button>
          {helpers.isCurrentUserAdmin(selectedTeam) && (
            <button
              onClick={() => controls.setActiveTab("invitations")}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === "invitations"
                  ? "border-accent text-accent"
                  : "border-transparent text-secondary-50 hover:text-secondary"
              }`}
            >
              Invitations ({invitations.length})
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Members Tab */}
        {activeTab === "members" && (
          <MembersTab
            selectedTeam={selectedTeam}
            editMode={editMode}
            loading={loading}
            actions={actions}
            helpers={helpers}
            controls={controls}
            user={user}
          />
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <AnnouncementsTab
            announcements={announcements}
            selectedTeam={selectedTeam}
            loading={loading}
            actions={actions}
            helpers={helpers}
            controls={controls}
          />
        )}

        {/* Invitations Tab */}
        {activeTab === "invitations" && (
          <InvitationsTab
            selectedTeam={selectedTeam}
            invitations={invitations}
            loading={loading}
            actions={actions}
            helpers={helpers}
            controls={controls}
          />
        )}
      </div>
    </div>
  );
};

// Members Tab Component
const MembersTab = ({
  selectedTeam,
  editMode,
  loading,
  actions,
  helpers,
  controls,
  user,
}: {
  selectedTeam: ITeam;
  editMode: boolean;
  loading: ReturnType<typeof useTeamInvitePage>["loading"];
  actions: ReturnType<typeof useTeamInvitePage>["actions"];
  helpers: ReturnType<typeof useTeamInvitePage>["helpers"];
  controls: ReturnType<typeof useTeamInvitePage>["controls"];
  user: NonNullable<ReturnType<typeof useTeamInvitePage>["user"]>;
}) => {
  return (
    <>
      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedTeam.members?.map((member: ITeamMember) => {
          const displayName = helpers.getMemberDisplayName(member);
          const initials =
            displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2) || "?";
          const isCurrentUser = member.user.user_id === user?.userId;
          const isAdmin = member.role === "admin";
          const isCreator =
            selectedTeam.created_by_user_id === member.user.user_id;

          return (
            <div
              key={member.user.user_id}
              className="bg-white rounded-xl border border-secondary-10 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                      isCreator
                        ? "bg-linear-to-br from-yellow-400 to-orange-500"
                        : isAdmin
                          ? "bg-linear-to-br from-accent to-blue-600"
                          : "bg-linear-to-br from-secondary-50 to-secondary"
                    }`}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">
                      {displayName}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-normal text-secondary-50">
                          (You)
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {isCreator ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          👑 Owner
                        </span>
                      ) : isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent">
                          ⭐ Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-secondary-10 text-secondary-50">
                          Member
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Actions */}
                {editMode && !isCurrentUser && !isCreator && (
                  <div className="flex flex-col gap-1">
                    {!isAdmin ? (
                      <button
                        onClick={() =>
                          actions.onPromoteToAdmin(member.user.user_id)
                        }
                        disabled={
                          loading.promotingMember === member.user.user_id
                        }
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
                      >
                        {loading.promotingMember === member.user.user_id
                          ? "..."
                          : "Promote"}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          actions.onDemoteFromAdmin(member.user.user_id)
                        }
                        disabled={
                          loading.demotingMember === member.user.user_id
                        }
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-secondary-10 text-secondary hover:bg-secondary-25 transition-colors disabled:opacity-50"
                      >
                        {loading.demotingMember === member.user.user_id
                          ? "..."
                          : "Demote"}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        actions.onRemoveMember(member.user.user_id)
                      }
                      disabled={loading.removingMember === member.user.user_id}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {loading.removingMember === member.user.user_id
                        ? "..."
                        : "Remove"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state for members */}
      {(!selectedTeam.members || selectedTeam.members.length === 0) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-10 rounded-full flex items-center justify-center">
            <Icon name={Icons.Group} size={32} className="text-secondary-50" />
          </div>
          <p className="text-lg font-medium text-secondary mb-2">
            No members yet
          </p>
          <p className="text-secondary-50 mb-4">
            Start by inviting people to your team
          </p>
          {helpers.isCurrentUserAdmin(selectedTeam) && (
            <button
              onClick={() => controls.setShowInvitePanel(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              <Icon name={Icons.Add} size={18} />
              Invite Members
            </button>
          )}
        </div>
      )}
    </>
  );
};

// Invitations Tab Component
const InvitationsTab = ({
  selectedTeam,
  invitations,
  loading,
  actions,
  helpers,
  controls,
}: {
  selectedTeam: ITeam;
  invitations: ReturnType<typeof useTeamInvitePage>["invitations"];
  loading: ReturnType<typeof useTeamInvitePage>["loading"];
  actions: ReturnType<typeof useTeamInvitePage>["actions"];
  helpers: ReturnType<typeof useTeamInvitePage>["helpers"];
  controls: ReturnType<typeof useTeamInvitePage>["controls"];
}) => {
  return (
    <>
      {invitations.length > 0 ? (
        <div className="space-y-3">
          {invitations.map((inv) => {
            const isPending = inv.status === null;

            return (
              <div
                key={inv.invitation_id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-secondary-10 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary-10 flex items-center justify-center">
                    <Icon
                      name={Icons.Mail}
                      size={20}
                      className="text-secondary-50"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-secondary">
                      {inv.recipient_email}
                    </p>
                    <p className="text-xs text-secondary-50">
                      Sent {new Date(inv.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(inv.status)}
                  {isPending && (
                    <button
                      onClick={() =>
                        actions.onCancelInvitation(inv.invitation_id)
                      }
                      disabled={
                        loading.cancelingInvitation === inv.invitation_id
                      }
                      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {loading.cancelingInvitation === inv.invitation_id
                        ? "..."
                        : "Cancel"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-10 rounded-full flex items-center justify-center">
            <Icon name={Icons.Mail} size={32} className="text-secondary-50" />
          </div>
          <p className="text-lg font-medium text-secondary mb-2">
            No invitations yet
          </p>
          <p className="text-secondary-50 mb-4">
            Invite people to join your team
          </p>
          {helpers.isCurrentUserAdmin(selectedTeam) && (
            <button
              onClick={() => {
                controls.setShowInvitePanel(true);
                controls.setActiveTab("members");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              <Icon name={Icons.Add} size={18} />
              Invite Someone
            </button>
          )}
        </div>
      )}
    </>
  );
};

// Announcements Tab Component
const AnnouncementsTab = ({
  announcements,
  selectedTeam,
  loading,
  actions,
  helpers,
  controls,
}: {
  announcements: ITeamAnnouncement[];
  selectedTeam: ITeam;
  loading: ReturnType<typeof useTeamInvitePage>["loading"];
  actions: ReturnType<typeof useTeamInvitePage>["actions"];
  helpers: ReturnType<typeof useTeamInvitePage>["helpers"];
  controls: ReturnType<typeof useTeamInvitePage>["controls"];
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const author = selectedTeam.members?.find(
              (m) => m.user.user_id === announcement.author_id,
            );
            const authorName = author
              ? `${author.user.first_name || ""} ${author.user.last_name || ""}`.trim() ||
                author.user.username
              : "Unknown";

            return (
              <div
                key={announcement.announcement_id}
                className="bg-white rounded-xl border border-secondary-10 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Icon
                        name={Icons.Announce}
                        size={20}
                        className="text-white"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-secondary text-lg">
                        {announcement.title}
                      </h3>
                      <p className="text-xs text-secondary-50">
                        Posted by {authorName} •{" "}
                        {formatDate(announcement.created_at)}
                        {announcement.updated_at !==
                          announcement.created_at && (
                          <span className="italic"> (edited)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {helpers.isCurrentUserAdmin(selectedTeam) && (
                    <button
                      onClick={() =>
                        actions.onDeleteAnnouncement(
                          announcement.announcement_id,
                        )
                      }
                      disabled={
                        loading.deletingAnnouncement ===
                        announcement.announcement_id
                      }
                      className="p-2 text-secondary-50 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete announcement"
                    >
                      {loading.deletingAnnouncement ===
                      announcement.announcement_id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Icon name={Icons.Trash} size={18} />
                      )}
                    </button>
                  )}
                </div>

                <div className="pl-13">
                  <p className="text-secondary whitespace-pre-wrap leading-relaxed">
                    {announcement.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-50 rounded-full flex items-center justify-center">
            <Icon name={Icons.Announce} size={32} className="text-yellow-500" />
          </div>
          <p className="text-lg font-medium text-secondary mb-2">
            No announcements yet
          </p>
          <p className="text-secondary-50 mb-4">
            {helpers.isCurrentUserAdmin(selectedTeam)
              ? "Post an announcement to share news with your team"
              : "Your team admins will post announcements here"}
          </p>
          {helpers.isCurrentUserAdmin(selectedTeam) && (
            <button
              onClick={() => controls.setShowAnnouncementModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
            >
              <Icon name={Icons.Announce} size={18} />
              Post Announcement
            </button>
          )}
        </div>
      )}
    </>
  );
};
