import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PatientService from '../patient.service';

export const DOCUMENT_QUERY_KEYS = {
  GET_USER_DOCUMENTS: 'GET_USER_DOCUMENTS',
};

export const useGetUserDocuments = () => {
  return useQuery({
    queryKey: [DOCUMENT_QUERY_KEYS.GET_USER_DOCUMENTS],
    queryFn: () => PatientService.getUserDocuments(),
    select: response => response.data,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => PatientService.uploadDocument(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DOCUMENT_QUERY_KEYS.GET_USER_DOCUMENTS],
      });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => PatientService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DOCUMENT_QUERY_KEYS.GET_USER_DOCUMENTS],
      });
    },
  });
};
