import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_EXPERT } from '../expert.interface';
import ExpertService from '../expert.service';

export function useGetConsultations({
  expertId,
}: {
  expertId: string | undefined;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_EXPERT.GET_CONSULTATIONS, expertId],
    queryFn: () => ExpertService.getConsultations(expertId || ''),
    enabled: !!expertId,
  });
}
