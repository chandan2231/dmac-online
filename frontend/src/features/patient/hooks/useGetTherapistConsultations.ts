import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_PATIENT } from '../patient.interface';
import PatientService from '../patient.service';
import type { IUser } from '../../auth/auth.interface';

export const useGetTherapistConsultations = (user: IUser | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_PATIENT.GET_THERAPIST_CONSULTATIONS, user?.id],
    queryFn: () => PatientService.getTherapistConsultationList(user),
    enabled: !!user?.id,
  });
};
