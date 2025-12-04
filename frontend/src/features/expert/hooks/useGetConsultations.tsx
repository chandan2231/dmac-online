import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_EXPERT } from '../expert.interface';
import ExpertService from '../expert.service';

export function useGetConsultations({
  expertId,
  patientName,
}: {
  expertId: string | undefined;
  patientName?: string;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_EXPERT.GET_CONSULTATIONS, expertId, patientName],
    queryFn: () => ExpertService.getConsultations(expertId || '', patientName),
    enabled: !!expertId,
  });
}
