import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_ADMIN } from '../admin.interface';
import AdminService from '../admin.service';

export function useGetProductFeatureKeys() {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_ADMIN.GET_PRODUCT_FEATURE_KEYS],
    queryFn: () => AdminService.getProductFeatureKeys(),
  });
}
