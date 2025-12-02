import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DocumentService from '../../../../services/document.service';

export const DOCUMENT_QUERY_KEYS = {
  GET_USER_DOCUMENTS: 'GET_USER_DOCUMENTS',
};

export const useGetUserDocuments = () => {
  return useQuery({
    queryKey: [DOCUMENT_QUERY_KEYS.GET_USER_DOCUMENTS],
    queryFn: () => DocumentService.getUserDocuments(),
    select: response => response.data,
  });
};

export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      DocumentService.uploadDocument(formData),
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
    mutationFn: (id: number) => DocumentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [DOCUMENT_QUERY_KEYS.GET_USER_DOCUMENTS],
      });
    },
  });
};
