export type JoinRequestStatus = 'APPROVE' | 'REJECT';

interface UserProfilePreview {
  firstName: string;
  lastName: string;
  profilePhotoUrl: string | null;
  jobTitle: string | null;
}

interface JoinRequestUser {
  id: string;
  email: string;
  profile: UserProfilePreview | null;
}

export interface EnterpriseJoinRequestResponse {
  id: string;
  userId: string;
  enterpriseId: string;
  status: JoinRequestStatus;
  requestedAt: string;         
  processedAt: string | null;  
  processedBy: string | null;
  user: JoinRequestUser;
}

