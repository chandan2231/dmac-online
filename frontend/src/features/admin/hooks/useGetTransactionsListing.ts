import { useQuery } from '@tanstack/react-query';
import {
  QUERY_KEYS_FOR_ADMIN,
  type TransactionFilter,
} from '../admin.interface';
import AdminService from '../admin.service';

export function useGetTransactionsListing(filter: TransactionFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_ADMIN.GET_TRANSACTION_LISTING, filter],
    queryFn: () => AdminService.getTransactionsListing(filter),
  });
}
