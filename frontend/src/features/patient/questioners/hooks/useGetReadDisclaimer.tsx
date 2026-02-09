import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_QUESTIONERS } from '../questioners.interface';
import QuestionersService from '../questioners.service';

export function useGetReadDisclaimer(
  languageCode: string,
  isModaOpen: boolean
) {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_QUESTIONERS.GET_READ_DISCLAIMER, languageCode],
    queryFn: () => QuestionersService.getReadDisclaimer(languageCode),
    enabled: !!languageCode && !!isModaOpen,
  });
}
