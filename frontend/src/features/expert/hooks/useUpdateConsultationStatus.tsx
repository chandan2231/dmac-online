import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExpertService from '../expert.service';
import { useSnackbar } from 'notistack';
import { QUERY_KEYS_FOR_EXPERT } from '../expert.interface';

export const useUpdateConsultationStatus = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ExpertService.updateConsultationStatus,
    onSuccess: () => {
      enqueueSnackbar('Consultation status updated successfully', {
        variant: 'success',
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS_FOR_EXPERT.GET_CONSULTATIONS],
      });
    },
    onError: (error: any) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
          'Failed to update consultation status',
        { variant: 'error' }
      );
    },
  });
};
