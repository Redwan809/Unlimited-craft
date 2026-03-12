export const feedbackMessages = {
  CANNOT_MERGE: "You can't merge with this.",
  CAN_MERGE: "Merge to create: ",
  READY: "Drop to combine!"
};

export type FeedbackType = 'success' | 'error' | 'info' | null;

export interface FeedbackState {
  message: string;
  type: FeedbackType;
  targetId: string | null;
}
