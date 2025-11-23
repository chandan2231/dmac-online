import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_QUESTIONERS } from '../questioners.interface';
import QuestionersService from '../questioners.service';

export function useGetQuestions(sequenceNumber: number, languageCode: string) {
  return useQuery({
    queryKey: [
      QUERY_KEYS_FOR_QUESTIONERS.GET_QUESTIONERS,
      sequenceNumber,
      languageCode,
    ],
    queryFn: () =>
      QuestionersService.getQuestions(sequenceNumber, languageCode),
    enabled: !!sequenceNumber && !!languageCode,
  });
}
