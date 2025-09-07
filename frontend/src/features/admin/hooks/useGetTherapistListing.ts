import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_ADMIN } from '../admin.interface';
import AdminService from '../admin.service';

export function useGetTherapistListing() {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_ADMIN.GET_THERAPIST_LISTING],
    queryFn: () => AdminService.getTherapistListing(),
  });
}
