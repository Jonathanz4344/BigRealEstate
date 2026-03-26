import { create } from "zustand";
import type { ITeamInvitation, ITeam } from "../interfaces";

type TeamsUpdater = ITeam[] | ((prev: ITeam[]) => ITeam[]);

interface TeamsState {
  teams: ITeam[];
  selectedTeamId: number | null;
  setTeams: (teamsOrUpdater: TeamsUpdater) => void;

  invitations: ITeamInvitation[];
  setInvitations: (invitations: ITeamInvitation[]) => void;

  selectedMemberId: number;
  isInvitee: boolean;
  setSelectedMemberId: (selectedMemberId: number, isInvitee: boolean) => void;

  addTeam: (team: ITeam) => void;
  updateTeam: (team: ITeam) => void;
  removeTeam: (teamId: number) => void;
  setSelectedTeamId: (teamId: number | null) => void;
  updateTeamMember: (teamId: number, userId: number, role: string) => void;
  addTeamMember: (teamId: number, member: ITeam["members"][0]) => void;
  removeTeamMember: (teamId: number, userId: number) => void;
}

export const useTeamsStore = create<TeamsState>((set) => ({
  teams: [],
  selectedTeamId: null,
  invitations: [],

  selectedMemberId: -1,
  isInvitee: false,
  setSelectedMemberId: (selectedMemberId: number, isInvitee: boolean) =>
    set({ selectedMemberId, isInvitee }),

  setTeams: (teamsOrUpdater) =>
    set((state) => ({
      teams:
        typeof teamsOrUpdater === "function"
          ? teamsOrUpdater(state.teams)
          : teamsOrUpdater,
    })),

  setInvitations: (invitations) => set({ invitations }),

  addTeam: (team) =>
    set((state) => {
      // Avoid duplicates
      if (state.teams.some((t) => t.team_id === team.team_id)) {
        return state;
      }
      return { teams: [...state.teams, team] };
    }),

  updateTeam: (team) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.team_id === team.team_id ? team : t)),
    })),

  removeTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.team_id !== teamId),
      selectedTeamId:
        state.selectedTeamId === teamId ? null : state.selectedTeamId,
    })),

  setSelectedTeamId: (teamId) => set({ selectedTeamId: teamId }),

  updateTeamMember: (teamId, userId, role) =>
    set((state) => ({
      teams: state.teams.map((t) => {
        if (t.team_id !== teamId) return t;
        return {
          ...t,
          members: t.members.map((m) =>
            m.user.user_id === userId ? { ...m, role } : m,
          ),
        };
      }),
    })),

  addTeamMember: (teamId, member) =>
    set((state) => ({
      teams: state.teams.map((t) => {
        if (t.team_id !== teamId) return t;
        // Avoid duplicates
        if (t.members.some((m) => m.user.user_id === member.user.user_id)) {
          return t;
        }
        return {
          ...t,
          members: [...t.members, member],
        };
      }),
    })),

  removeTeamMember: (teamId, userId) =>
    set((state) => ({
      teams: state.teams.map((t) => {
        if (t.team_id !== teamId) return t;
        return {
          ...t,
          members: t.members.filter((m) => m.user.user_id !== userId),
        };
      }),
    })),
}));
