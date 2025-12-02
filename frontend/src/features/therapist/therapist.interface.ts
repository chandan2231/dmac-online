export const QUERY_KEYS_FOR_THERAPIST = {
  GET_THERAPIST_SLOTS: 'getTherapistSlots',
  GET_CONSULTATIONS: 'getConsultations',
  GET_THERAPIST_PATIENTS: 'getTherapistPatients',
  GET_THERAPIST_REVIEW: 'getTherapistReview',
} as const;

export interface ISlot {
  end_time: string;
  start_time: string;
  is_booked: number;
  is_day_off: number;
  is_slot_available: number;
}

export type ISlotsData = Record<string, ISlot[]>;

export interface IAvailabilitySlot {
  id: string;
  date: string;
  slots: ISlot[];
  is_day_off: number;
  start_time: string;
  end_time: string;
}
