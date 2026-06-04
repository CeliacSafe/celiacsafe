/** Nutzer-Vorschlag / Excel-Blatt ``submissions`` */

export type SubmissionStatus =
  | 'pending'
  | 'in_review'
  | 'promoted'
  | 'rejected';

export interface RestaurantSubmission {
  id: string;
  submittedAt: string;
  submittedByEmail?: string;
  submittedByName?: string;
  restaurantName: string;
  city: string;
  countryCode: string;
  address?: string;
  website?: string;
  phone?: string;
  notes?: string;
  status: SubmissionStatus;
  promotedToRestaurantId?: string;
  rejectionReason?: string;
  source: 'app' | 'csv' | 'email';
}
