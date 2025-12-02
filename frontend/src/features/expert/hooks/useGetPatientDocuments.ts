import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_EXPERT } from '../expert.interface';
import ExpertService from '../expert.service';

export function useGetPatientDocuments(patientId: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_EXPERT.GET_PATIENT_DOCUMENTS, patientId],
    queryFn: () => ExpertService.getPatientDocuments(patientId!),
    enabled: !!patientId,
  });
}
