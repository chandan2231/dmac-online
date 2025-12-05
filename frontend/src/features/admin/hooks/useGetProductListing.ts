import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_ADMIN } from '../admin.interface';
import AdminService from '../admin.service';

export function useGetProductListing() {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_ADMIN.GET_PRODUCT_LISTING],
    queryFn: () => AdminService.getProductsListing(),
  });
}
