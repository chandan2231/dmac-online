import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_EXPERT } from '../expert.interface';
import ExpertService from '../expert.service';

export function useGetExpertPatients({
  expertId,
}: {
  expertId: string | undefined;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_EXPERT.GET_EXPERT_PATIENTS, expertId],
    queryFn: () =>
      ExpertService.getExpertPatients({
        expertId,
      }),
    enabled: !!expertId,
  });
}
