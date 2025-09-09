import { useQuery } from '@tanstack/react-query';
import {
  QUERY_KEYS_FOR_ADMIN,
  type ConsultationFilter,
} from '../admin.interface';
import AdminService from '../admin.service';

export function useGetConsultationsListing(consultantId: ConsultationFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_ADMIN.GET_CONSULTATION_LISTING, consultantId],
    queryFn: () => AdminService.getConsultationsListing(consultantId),
  });
}
