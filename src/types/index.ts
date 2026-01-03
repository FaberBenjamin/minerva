import { Timestamp, User } from 'firebase/firestore';

// ==================== Address Types ====================

export interface Address {
  pir: string;
  street: string;
  streetType: string;
  houseNumber: string;
  fullAddress: string;
}

export interface AddressInput {
  pir: string;
  street: string;
  streetType: string;
  houseNumber: string;
}

// ==================== District Types ====================

export interface District {
  oevk: string | null;
  votingStation: string | null;
  status: 'matched' | 'unknown';
}

export interface DistrictRecord {
  OEVK: string;
  'Szavazókör': string;
  'Közterület név': string;
  'Közterület jelleg': string;
  'Házszám': string;
  Település: string;
  PIR: string;
}

// ==================== Volunteer Types ====================

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  district: District;
  createdAt: Timestamp;
  submittedAt: Timestamp;
}

export interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  pir: string;
  street: string;
  streetType: string;
  houseNumber: string;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  pir?: string;
  street?: string;
  streetType?: string;
  houseNumber?: string;
}

// ==================== Admin Types ====================

export interface Admin {
  uid: string;
  email: string;
  name: string;
  createdAt: Timestamp;
  invitedBy: string;
}

export interface UserProfile {
  email: string | null;
  name?: string | null;
  uid?: string;
}

// ==================== Toast Types ====================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ==================== Voting Station Types ====================

export interface VotingStation {
  oevk: string;
  votingStation: string;
  count: number;
}

// ==================== Export Types ====================

export interface ExportVolunteer {
  name: string;
  email: string;
  phone: string;
  fullAddress: string;
  oevk: string;
  votingStation: string;
}
