import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_QUESTIONERS } from '../questioners.interface';
import QuestionersService from '../questioners.service';

export function useGetDisclaimerPageDetails(languageCode: string) {
  return useQuery({
    queryKey: [
      QUERY_KEYS_FOR_QUESTIONERS.GET_DISCLAIMER_PAGE_DETAILS,
      languageCode,
    ],
    queryFn: () => QuestionersService.getDisclaimerPageDetails(languageCode),
    enabled: !!languageCode,
  });
}
