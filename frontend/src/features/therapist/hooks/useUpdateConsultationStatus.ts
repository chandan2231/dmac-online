import { useMutation, useQueryClient } from '@tanstack/react-query';
import TherapistService from '../therapist.service';
import { useSnackbar } from 'notistack';
import { QUERY_KEYS_FOR_THERAPIST } from '../therapist.interface';

export const useUpdateConsultationStatus = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: TherapistService.updateConsultationStatus,
    onSuccess: () => {
      enqueueSnackbar('Consultation status updated successfully', {
        variant: 'success',
      });
      // Invalidate queries if we were using react-query for fetching
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS_FOR_THERAPIST.GET_CONSULTATIONS],
      });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
          'Failed to update consultation status',
        { variant: 'error' }
      );
    },
  });
};
