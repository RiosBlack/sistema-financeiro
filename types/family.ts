export interface Family {
  id: string;
  name: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
  members: FamilyMember[];
  _count?: {
    members: number;
    invitations: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId: string;
  role: "OWNER" | "MEMBER";
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  joinedAt: string;
}

export interface FamilyInvitation {
  id: string;
  familyId: string;
  invitedId: string;
  invitedBy: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  family: {
    id: string;
    name: string;
    createdBy: {
      id: string;
      name: string | null;
      email: string | null;
    };
    _count?: {
      members: number;
    };
  };
  invited: {
    id: string;
    name: string | null;
    email: string | null;
  };
  inviter: {
    id: string;
    name: string | null;
    email: string | null;
  };
  createdAt: string;
  respondedAt: string | null;
}

