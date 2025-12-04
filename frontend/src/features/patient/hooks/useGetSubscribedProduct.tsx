import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_PATIENT } from '../patient.interface';
import type { IUser } from '../../auth/auth.interface';
import PatientService from '../patient.service';

export function useGetSubscribedProduct(user: IUser | null) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_PATIENT.GET_SUBSCRIBED_PRODUCTS],
    queryFn: () => PatientService.getSubscribedProduct(user),
    enabled: !!user,
  });
}
