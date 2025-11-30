import { useMutation, useQueryClient } from '@tanstack/react-query';
import ExpertService from '../expert.service';
import { useSnackbar } from 'notistack';

export const useUpdateConsultationStatus = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ExpertService.updateConsultationStatus,
    onSuccess: () => {
      enqueueSnackbar('Consultation status updated successfully', {
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['expert-consultations'] });
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
