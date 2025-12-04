import { useQuery } from '@tanstack/react-query';
import ExpertService from '../expert.service';

export const useGetExpertReviews = (expertId: string | undefined) => {
  return useQuery({
    queryKey: ['expertReviews', expertId],
    queryFn: () =>
      expertId ? ExpertService.getExpertReviews(expertId) : Promise.resolve([]),
    enabled: !!expertId,
  });
};
