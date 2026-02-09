import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PatientService from '../patient.service';

export const MEDICAL_HISTORY_QUERY_KEYS = {
  GET_LATEST_MEDICAL_HISTORY: 'GET_LATEST_MEDICAL_HISTORY',
};

export const useGetLatestMedicalHistory = () => {
  return useQuery({
    queryKey: [MEDICAL_HISTORY_QUERY_KEYS.GET_LATEST_MEDICAL_HISTORY],
    queryFn: () => PatientService.getLatestMedicalHistory(),
    select: response => response.data,
  });
};

export const useSubmitMedicalHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => PatientService.submitMedicalHistory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [MEDICAL_HISTORY_QUERY_KEYS.GET_LATEST_MEDICAL_HISTORY],
      });
    },
  });
};
