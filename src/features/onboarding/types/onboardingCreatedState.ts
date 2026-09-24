/** Router state passed back to the onboarding list after the wizard finishes. */
export interface OnboardingCreatedState {
  createdId: string;
  /** Seats bought because a pool was full. */
  seatsAdded: number;
}
