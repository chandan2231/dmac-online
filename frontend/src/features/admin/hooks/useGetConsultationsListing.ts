import { useQuery } from '@tanstack/react-query';
import {
  QUERY_KEYS_FOR_ADMIN,
  type ConsultationFilter,
} from '../admin.interface';
import AdminService from '../admin.service';

export function useGetConsultationsListing(filter: ConsultationFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_ADMIN.GET_CONSULTATION_LISTING, filter],
    queryFn: () => AdminService.getConsultationsListing(filter),
  });
}
