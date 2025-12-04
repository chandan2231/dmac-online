import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_EXPERT } from '../expert.interface';
import ExpertService from '../expert.service';

export function useGetExpertSlots({
  expertId,
}: {
  expertId: string | undefined;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_EXPERT.GET_EXPERT_SLOTS],
    queryFn: () =>
      ExpertService.getExpertSlots({
        expertId,
      }),
    enabled: !!expertId,
  });
}
