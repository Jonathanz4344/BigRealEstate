import {
  DashboardAnnouncementsCard,
  BoardsListCard,
  Button,
  DashboardModals,
  LeaderBoardsCard,
  PropertiesListCard,
  TextInput,
} from "../../components";
import {
  useDashboardHighlightComponents,
  useDashboardPage,
  useShouldShowTutorial,
} from "../../hooks";
import { LoadingPage } from "../Loading";
import {
  AdminCardList,
  DashboardHeader,
  InvitedCardList,
  TeamCardList,
} from "./components";
import transition from "../../utils/transitions/transition";
import { TutorialPage } from "../../stores";

export const DashboardPage = transition(() => {
  const {
    newTeamName,
    setNewTeamName,

    selectedTeam,
    adminMembers,
    isUserAdmin,
    teamMembers,
    leaderboardMembers,

    invitations,

    userProperties,
    userBoards,

    teamProperties,
    teamBoards,

    announcements,

    openTeamInvitationModal,
    openViewMemberModal,
    openLeaderboardModal,
    openCreatePropertyModal,
    openViewPropertiesModal,
    openCreateBoardModal,
    openViewBoardsModal,
    openCreateAnnouncmentModal,
    openViewAnnouncementsModal,
    onAddTeamPropertyClick,
    openViewTeamPropertiesModal,

    onUserPropertyClick,
    onCreateTeam,
    onBoardClick,
    onDeleteAnnouncement,
    onEditAnnouncementClick,
    onAddTeamBoardClick,
    onTeamPropertyClick,

    setSelectedMemberId,

    displayOverflow,
    overflow,
    sliceCount,

    loading,

    showAllInCards,
  } = useDashboardPage();

  const dashboardHighlightComponents = useDashboardHighlightComponents();
  const highlighComponentRefs = dashboardHighlightComponents.refs;
  useShouldShowTutorial({
    page: TutorialPage.Dashboard,
    forceWait: selectedTeam ? false : true,
    highlightComponentDims: dashboardHighlightComponents.highlightComponentDims,
    highlightComponentDimsChange:
      dashboardHighlightComponents.highlightComponentDimsChange,
    components: [
      null,
      () => (
        <DashboardHeader
          newTeamName={newTeamName}
          isUserAdmin={isUserAdmin}
          displayOnly
        />
      ),
      () => (
        <AdminCardList
          displayOverflowCount={displayOverflow.admin}
          overflowCount={overflow.admin}
          spliceCount={sliceCount.admin}
          members={adminMembers}
          button={{
            visible: overflow.admin > 0,
            text: showAllInCards.admins.all ? "View less" : "View all",
          }}
        />
      ),
      () => (
        <InvitedCardList
          displayOverflowCount={displayOverflow.invitations}
          overflowCount={overflow.invitations}
          spliceCount={sliceCount.invitations}
          invitations={invitations}
          button={{
            visible: overflow.invitations > 0,
            text: showAllInCards.invitations.all ? "View less" : "View all",
          }}
          onAdd={() => {}}
        />
      ),
      () => (
        <TeamCardList
          displayOverflowCount={displayOverflow.teamMembers}
          overflowCount={overflow.teamMembers}
          spliceCount={sliceCount.teamMembers}
          members={teamMembers}
          button={{
            visible: overflow.teamMembers > 0,
            text: showAllInCards.teamMembers.all ? "View less" : "View all",
          }}
        />
      ),
      () => (
        <DashboardAnnouncementsCard
          title="Announcments:"
          overflowCount={overflow.announcements}
          messages={[...announcements].splice(0, sliceCount.announcements + 1)}
          btnProps={
            overflow.announcements > 0 ? { text: "View all" } : undefined
          }
          onAdd={isUserAdmin ? () => {} : undefined}
        />
      ),
      () => (
        <LeaderBoardsCard
          title="Team Leaderboard:"
          overflowCount={overflow.leaderboard}
          btnProps={
            overflow.leaderboard > 0
              ? { text: "View all", onClick: openLeaderboardModal }
              : undefined
          }
          users={[...leaderboardMembers].splice(0, sliceCount.leaderboard + 1)}
        />
      ),
      () => (
        <PropertiesListCard
          overflowCount={overflow.property}
          properties={[...userProperties].splice(0, sliceCount.property + 1)}
          title="My Properties:"
          onAdd={() => {}}
          btnProps={
            overflow.property > 0
              ? {
                  text: "View all",
                }
              : undefined
          }
        />
      ),
      () => (
        <PropertiesListCard
          overflowCount={overflow.teamProperties}
          properties={[...teamProperties.current].splice(
            0,
            sliceCount.teamProperties + 1,
          )}
          title="Team Properties:"
          btnProps={
            overflow.teamProperties > 0
              ? {
                  text: "View all",
                }
              : undefined
          }
          onAdd={() => {}}
        />
      ),
      () => (
        <div className="flex flex-row gap-15">
          <div className="flex-1">
            <BoardsListCard
              boards={teamBoards.current}
              title="Team Boards:"
              onAdd={isUserAdmin ? () => {} : undefined}
            />
          </div>
          <div className="flex-1">
            <BoardsListCard
              overflowCount={overflow.boards}
              boards={[...userBoards].splice(0, sliceCount.boards + 1)}
              title="My Boards:"
              btnProps={
                overflow.boards > 0
                  ? {
                      text: "View all",
                    }
                  : undefined
              }
              onAdd={() => {}}
            />
          </div>
        </div>
      ),
      null,
    ],
  });

  return (
    <div className="flex flex-col gap-y-15 flex-1 p-15">
      {selectedTeam && (
        <div className="w-full px-15 ">
          <DashboardHeader
            ref={highlighComponentRefs.teamNameRef}
            newTeamName={newTeamName}
            setNewTeamName={setNewTeamName}
            isUserAdmin={isUserAdmin}
          />
        </div>
      )}

      {loading.loadingTeams && !selectedTeam && (
        <div className="grow flex justify-center items-center">
          <LoadingPage text="" />
        </div>
      )}

      {!loading.loadingTeams && !selectedTeam && (
        <div className="grow flex flex-col justify-center items-center">
          <div className="card-base box-shadow p-7.5 flex flex-col justify-center items-center space-y-7.5">
            <div className="w-full flex flex-col justify-center items-center space-y-3.75">
              <div className=" flex flex-col justify-center items-center">
                <p className="text-sm text-secondary-50">
                  You do not have a team yet.
                </p>
                <p className="text-lg font-bold">Create a new team</p>
              </div>
              <div className="w-full">
                <TextInput
                  value={newTeamName}
                  setValue={setNewTeamName}
                  label="Team Name"
                />
              </div>
            </div>

            <div className="flex flex-col justify-center items-center">
              <p className="text-md text-secondary-50">or</p>
              <p className="text-md">
                Please reach out to your admin to recieve an invite.
              </p>
            </div>

            <div className="flex flex-col justify-center items-center">
              <div className="w-75">
                <Button
                  onClick={onCreateTeam}
                  text="Create team"
                  disabled={newTeamName.length === 0}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTeam && (
        <div className="gap-y-15 flex flex-col flex-1">
          <div className="flex flex-row gap-x-15">
            <div className="flex-1">
              <AdminCardList
                ref={highlighComponentRefs.adminCardRef}
                displayOverflowCount={displayOverflow.admin}
                overflowCount={overflow.admin}
                spliceCount={sliceCount.admin}
                members={adminMembers}
                button={{
                  visible: overflow.admin > 0,
                  text: showAllInCards.admins.all ? "View less" : "View all",
                  onClick: showAllInCards.admins.toggle,
                }}
                onClick={(i) => (
                  setSelectedMemberId(adminMembers[i].user.user_id, false),
                  openViewMemberModal()
                )}
              />
            </div>
            <div className="flex-1">
              {isUserAdmin && (
                <InvitedCardList
                  ref={highlighComponentRefs.invitationCardRef}
                  displayOverflowCount={displayOverflow.invitations}
                  overflowCount={overflow.invitations}
                  spliceCount={sliceCount.invitations}
                  invitations={invitations}
                  button={{
                    visible: overflow.invitations > 0,
                    text: showAllInCards.invitations.all
                      ? "View less"
                      : "View all",
                    onClick: showAllInCards.invitations.toggle,
                  }}
                  onClick={(i) => (
                    setSelectedMemberId(invitations[i].invitation_id, true),
                    openViewMemberModal()
                  )}
                  onAdd={openTeamInvitationModal}
                />
              )}
              {!isUserAdmin && (
                <TeamCardList
                  ref={highlighComponentRefs.membersRef}
                  displayOverflowCount={displayOverflow.teamMembers}
                  overflowCount={overflow.teamMembers}
                  spliceCount={sliceCount.teamMembers}
                  members={teamMembers}
                  button={{
                    visible: overflow.teamMembers > 0,
                    text: showAllInCards.teamMembers.all
                      ? "View less"
                      : "View all",
                    onClick: showAllInCards.teamMembers.toggle,
                  }}
                  onClick={(i) => (
                    setSelectedMemberId(teamMembers[i].user.user_id, false),
                    openViewMemberModal()
                  )}
                  onAdd={openTeamInvitationModal}
                />
              )}
            </div>
          </div>

          {isUserAdmin && (
            <div className="flex">
              <TeamCardList
                ref={highlighComponentRefs.membersRef}
                displayOverflowCount={displayOverflow.teamMembers}
                overflowCount={overflow.teamMembers}
                spliceCount={sliceCount.teamMembers}
                members={teamMembers}
                button={{
                  visible: overflow.teamMembers > 0,
                  text: showAllInCards.teamMembers.all
                    ? "View less"
                    : "View all",
                  onClick: showAllInCards.teamMembers.toggle,
                }}
                onClick={(i) => (
                  setSelectedMemberId(teamMembers[i].user.user_id, false),
                  openViewMemberModal()
                )}
                onAdd={openTeamInvitationModal}
              />
            </div>
          )}

          <div className="flex flex-row gap-x-15">
            <div className="w-[70%] min-w-[70%] max-w-[70%]">
              <DashboardAnnouncementsCard
                ref={highlighComponentRefs.announcmentRef}
                title="Announcements:"
                overflowCount={overflow.announcements}
                messages={[...announcements].splice(
                  0,
                  sliceCount.announcements + 1,
                )}
                onAdd={isUserAdmin ? openCreateAnnouncmentModal : undefined}
                btnProps={
                  overflow.announcements > 0
                    ? { text: "View all", onClick: openViewAnnouncementsModal }
                    : undefined
                }
                onEdit={onEditAnnouncementClick}
                onTrash={onDeleteAnnouncement}
              />
            </div>
            <div className="grow">
              <LeaderBoardsCard
                ref={highlighComponentRefs.leaderboardsRef}
                title="Team Leaderboard:"
                overflowCount={overflow.leaderboard}
                btnProps={
                  overflow.leaderboard > 0
                    ? { text: "View all", onClick: openLeaderboardModal }
                    : undefined
                }
                users={[...leaderboardMembers].splice(
                  0,
                  sliceCount.leaderboard + 1,
                )}
                onClick={(i) => (
                  setSelectedMemberId(leaderboardMembers[i].id, false),
                  openViewMemberModal()
                )}
              />
            </div>
          </div>

          <div className="flex flex-row gap-15">
            <div className="flex-1">
              <PropertiesListCard
                ref={highlighComponentRefs.teamPropertiesRef}
                overflowCount={overflow.teamProperties}
                properties={[...teamProperties.current].splice(
                  0,
                  sliceCount.teamProperties + 1,
                )}
                title="Team Properties:"
                btnProps={
                  overflow.teamProperties > 0
                    ? {
                        text: "View all",
                        onClick: openViewTeamPropertiesModal,
                      }
                    : undefined
                }
                onAdd={isUserAdmin ? onAddTeamPropertyClick : undefined}
                onClick={onTeamPropertyClick}
              />
            </div>
            <div className="flex-1">
              <PropertiesListCard
                ref={highlighComponentRefs.propertiesRef}
                overflowCount={overflow.property}
                properties={[...userProperties].splice(
                  0,
                  sliceCount.property + 1,
                )}
                title="My Properties:"
                onAdd={openCreatePropertyModal}
                btnProps={
                  overflow.property > 0
                    ? {
                        text: "View all",
                        onClick: openViewPropertiesModal,
                      }
                    : undefined
                }
                onClick={onUserPropertyClick}
              />
            </div>
          </div>

          <div
            ref={highlighComponentRefs.teamBoardsRef}
            className="flex flex-row gap-15"
          >
            <div className="flex-1">
              <BoardsListCard
                boards={teamBoards.current}
                title="Team Boards:"
                onClick={onBoardClick}
                onAdd={isUserAdmin ? onAddTeamBoardClick : undefined}
              />
            </div>
            <div className="flex-1">
              <BoardsListCard
                overflowCount={overflow.boards}
                boards={[...userBoards].splice(0, sliceCount.boards + 1)}
                title="My Boards:"
                btnProps={
                  overflow.boards > 0
                    ? {
                        text: "View all",
                        onClick: openViewBoardsModal(userBoards, `My Boards:`),
                      }
                    : undefined
                }
                onClick={onBoardClick}
                onAdd={openCreateBoardModal}
              />
            </div>
          </div>
        </div>
      )}

      <DashboardModals />
    </div>
  );
});
