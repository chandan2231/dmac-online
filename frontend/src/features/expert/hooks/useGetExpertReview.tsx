import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_EXPERT } from '../expert.interface';
import ExpertService from '../expert.service';

export function useGetExpertReview(consultationId: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_EXPERT.GET_EXPERT_REVIEW, consultationId],
    queryFn: () => ExpertService.getExpertReview(consultationId!),
    enabled: !!consultationId,
  });
}
