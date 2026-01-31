import { useQuery } from '@tanstack/react-query';
import PartnerService from '../partners.service';

export const QUERY_KEYS_FOR_PARTNERS = {
  GET_PARTNERS_LIST: 'GET_PARTNERS_LIST',
} as const;

export function useGetPartnersList() {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_PARTNERS.GET_PARTNERS_LIST],
    queryFn: () => PartnerService.getPartnersList(),
  });
}
