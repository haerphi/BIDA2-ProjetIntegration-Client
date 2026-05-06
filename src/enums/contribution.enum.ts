export const ContributionStatus = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
};

export type ContributionStatusEnum = (typeof ContributionStatus)[keyof typeof ContributionStatus];
