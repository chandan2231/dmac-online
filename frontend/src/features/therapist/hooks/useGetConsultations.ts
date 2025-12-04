import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_THERAPIST } from '../therapist.interface';
import TherapistService from '../therapist.service';

export function useGetConsultations({
  therapistId,
  patientName,
}: {
  therapistId: string | undefined;
  patientName?: string;
}) {
  return useQuery({
    queryKey: [
      QUERY_KEYS_FOR_THERAPIST.GET_CONSULTATIONS,
      therapistId,
      patientName,
    ],
    queryFn: () =>
      TherapistService.getConsultationList(therapistId || '', patientName),
    enabled: !!therapistId,
  });
}
