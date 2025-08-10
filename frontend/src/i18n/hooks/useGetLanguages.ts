import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_LANGUAGE } from '../language.interface';
import LanguageService from '../language.service';

export function useLanguageList() {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_LANGUAGE.GET_LANGUAGE_LIST],
    queryFn: LanguageService.fetchLanguageList,
  });
}
