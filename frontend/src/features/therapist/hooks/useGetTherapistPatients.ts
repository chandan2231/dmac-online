import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_THERAPIST } from '../therapist.interface';
import TherapistService from '../therapist.service';

export function useGetTherapistPatients({
  therapistId,
}: {
  therapistId: string | undefined;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_THERAPIST.GET_THERAPIST_PATIENTS, therapistId],
    queryFn: () =>
      TherapistService.getTherapistPatients({
        therapistId,
      }),
    enabled: !!therapistId,
  });
}
