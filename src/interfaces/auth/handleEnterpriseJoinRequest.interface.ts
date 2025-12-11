type JoinRequestAction = 'APPROVE' | 'REJECT';

export interface HandleEnterpriseJoinRequestInput {
  requestId: string;
  action: JoinRequestAction;
}

export interface HandleEnterpriseJoinRequestOutput {
  message: string;
}
