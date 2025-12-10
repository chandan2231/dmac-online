import { useQuery } from '@tanstack/react-query';
import AdminService from '../admin.service';

export const useGetCountryAdminListing = () => {
  return useQuery({
    queryKey: ['adminCountryAdminListing'],
    queryFn: () => AdminService.getCountryAdminListing(),
  });
};
