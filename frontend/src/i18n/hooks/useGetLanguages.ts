import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_LANGUAGE } from '../language.interface';
import type { UserRole } from '../../features/auth/auth.interface';
import LanguageService from '../language.service';

export function useLanguageList({
  enable = true,
  USER_TYPE = null,
}: {
  enable?: boolean;
  USER_TYPE: UserRole | null;
}) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_LANGUAGE.GET_LANGUAGE_LIST],
    queryFn: () =>
      LanguageService.fetchLanguageList({
        USER_TYPE,
      }),
    enabled: enable,
  });
}
