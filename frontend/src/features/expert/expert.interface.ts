export const QUERY_KEYS_FOR_EXPERT = {
  GET_EXPERT_SLOTS: 'getExpertSlots',
} as const;

export interface ISlot {
  available: number;
  booked: number;
  day_off: number;
  end_time: string;
  start_time: string;
}

export type ISlotsData = Record<string, ISlot[]>;

export interface IAvailabilitySlot {
  id: string;
  date: string;
  slots: ISlot[];
  day_off: number;
  start_time: string;
  end_time: string;
}
