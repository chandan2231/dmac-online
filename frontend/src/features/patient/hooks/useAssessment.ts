import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PatientService from '../patient.service';

export const ASSESSMENT_QUERY_KEYS = {
  GET_ASSESSMENT_STATUS: 'GET_ASSESSMENT_STATUS',
};

export const useGetAssessmentStatus = () => {
  return useQuery({
    queryKey: [ASSESSMENT_QUERY_KEYS.GET_ASSESSMENT_STATUS],
    queryFn: () => PatientService.getAssessmentStatus(),
    select: response => response.data,
  });
};

export const useSubmitAssessmentTab = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tab, data }: { tab: string; data: unknown }) =>
      PatientService.submitAssessmentTab(tab, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ASSESSMENT_QUERY_KEYS.GET_ASSESSMENT_STATUS],
      });
    },
  });
};
