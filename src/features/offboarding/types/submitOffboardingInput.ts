import type { OffboardingRequest } from '../../../types/offboarding';

export type SubmitOffboardingInput = Omit<OffboardingRequest, 'id' | 'reference' | 'status' | 'licencesEndOn' | 'createdAt'>;
