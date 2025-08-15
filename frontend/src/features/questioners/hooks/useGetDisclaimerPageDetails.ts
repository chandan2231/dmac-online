import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_QUESTIONERS } from '../questioners.interface';
import QuestionersService from '../questioners.service';

export function useGetDisclaimerPageDetails() {
  return useQuery({
    queryKey: [QUERY_KEYS_FOR_QUESTIONERS.GET_DISCLAIMER_PAGE_DETAILS],
    queryFn: QuestionersService.getDisclaimerPageDetails,
  });
}
