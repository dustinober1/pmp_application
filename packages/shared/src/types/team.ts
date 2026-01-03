/**
 * Team Management types (Corporate tier)
 */

export type TeamRole = "admin" | "member";
export type TeamGoalType = "completion" | "accuracy" | "study_time";
export type TeamAlertType = "behind_schedule" | "inactive" | "struggling";
export type ReportFormat = "csv" | "pdf";

export interface Team {
  id: string;
  name: string;
  adminId: string;
  licenseCount: number;
  members: TeamMember[];
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  user?: TeamMemberUser;
}

export interface TeamMemberUser {
  id: string;
  name: string;
  email: string;
}

export interface CreateTeamInput {
  name: string;
  licenseCount: number;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

export interface TeamDashboard {
  teamId: string;
  teamName: string;
  totalMembers: number;
  activeMembers: number;
  averageProgress: number;
  averageReadinessScore: number;
  memberStats: MemberStats[];
  goalProgress: GoalProgress[];
  alerts: TeamAlert[];
}

export interface MemberStats {
  memberId: string;
  userId: string;
  userName: string;
  progress: number;
  readinessScore: number;
  lastActiveDate: Date | null;
  studyStreak: number;
}

export interface TeamGoal {
  id: string;
  teamId: string;
  type: TeamGoalType;
  target: number;
  deadline: Date;
  createdAt: Date;
}

export interface GoalProgress {
  goalId: string;
  type: TeamGoalType;
  target: number;
  current: number;
  deadline: Date;
  isComplete: boolean;
  memberProgress: MemberGoalProgress[];
}

export interface MemberGoalProgress {
  memberId: string;
  userName: string;
  current: number;
  target: number;
  isComplete: boolean;
}

export interface TeamAlert {
  id: string;
  memberId: string;
  memberName: string;
  type: TeamAlertType;
  message: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface ReportOptions {
  format: ReportFormat;
  startDate?: Date;
  endDate?: Date;
  includeDetails?: boolean;
}

export interface TeamReport {
  teamId: string;
  teamName: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: TeamReportSummary;
  memberDetails?: MemberReportDetail[];
  downloadUrl?: string;
}

export interface TeamReportSummary {
  totalMembers: number;
  completedGoals: number;
  averageProgress: number;
  totalStudyHours: number;
}

export interface MemberReportDetail {
  userId: string;
  userName: string;
  progress: number;
  studyHours: number;
  completedGoals: number;
  lastActiveDate: Date | null;
}
