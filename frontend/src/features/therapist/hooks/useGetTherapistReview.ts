import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_THERAPIST } from '../therapist.interface';
import TherapistService from '../therapist.service';

export function useGetTherapistReview(consultationId: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_THERAPIST.GET_THERAPIST_REVIEW, consultationId],
    queryFn: () => TherapistService.getTherapistReview(consultationId!),
    enabled: !!consultationId,
  });
}
