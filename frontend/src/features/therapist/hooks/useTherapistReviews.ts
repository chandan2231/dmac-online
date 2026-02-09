import { useQuery } from '@tanstack/react-query';
import TherapistService from '../therapist.service';

export const useTherapistReviews = (therapistId: string | undefined) => {
  return useQuery({
    queryKey: ['therapistReviews', therapistId],
    queryFn: () =>
      therapistId
        ? TherapistService.getTherapistReviews(therapistId)
        : Promise.resolve([]),
    enabled: !!therapistId,
  });
};
