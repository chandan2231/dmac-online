import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_ADMIN } from '../admin.interface';
import AdminService from '../admin.service';

export function useGetUsersListing(role: string) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_ADMIN.GET_USER_LISTING, role],
    queryFn: () => AdminService.getUsersListing(role),
    enabled: Boolean(role),
  });
}
