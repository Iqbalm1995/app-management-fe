export interface UserActivityResponse {
  id: string;
  userId: string;
  activity: string;
  createdAt: string;
  userData: UserActivityUserData;
}

interface UserActivityUserData {
  id: string;
  userCode: string;
  userFirstName: string;
  userLastName: string;
  username: string;
  isActive: string;
  profilePict: string | null;
  lastLogin: string | null;
  divisionId: string | null;
  createdAt: string;
  createdBy: string;
  userEmail: string | null;
  userPhoneNumber: string | null;
  role: UserActivityUserRole;
  team: UserActivityUserTeam | null;
  teamRole: UserActivityUserTeamRole | null;
}

interface UserActivityUserRole {
  id: string;
  roleCode: string;
  roleName: string;
}

interface UserActivityUserTeam {
  id: string;
  teamCode: string;
  teamName: string;
}

interface UserActivityUserTeamRole {
  id: string;
  teamRoleCode: string;
  teamRoleName: string;
}
