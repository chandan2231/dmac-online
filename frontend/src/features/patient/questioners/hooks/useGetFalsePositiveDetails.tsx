import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_QUESTIONERS } from '../questioners.interface';
import QuestionersService from '../questioners.service';

export function useGetFalsePositivePageDetails(languageCode: string) {
  return useQuery({
    queryKey: [
      QUERY_KEYS_FOR_QUESTIONERS.GET_FALSE_POSITIVE_PAGE_DETAILS,
      languageCode,
    ],
    queryFn: () => QuestionersService.getFalsePositivePageDetails(languageCode),
    enabled: !!languageCode,
  });
}
