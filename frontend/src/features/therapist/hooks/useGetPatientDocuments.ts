import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_THERAPIST } from '../therapist.interface';
import TherapistService from '../therapist.service';

export function useGetPatientDocuments(patientId: number | null) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_THERAPIST.GET_PATIENT_DOCUMENTS, patientId],
    queryFn: () => TherapistService.getPatientDocuments(patientId!),
    enabled: !!patientId,
  });
}
