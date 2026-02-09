import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS_FOR_QUESTIONERS } from '../questioners.interface';
import QuestionersService from '../questioners.service';

export function useGetPreTestPageDetails(languageCode: string) {
    return useQuery({
        queryKey: [
            QUERY_KEYS_FOR_QUESTIONERS.GET_PRE_TEST_PAGE_DETAILS,
            languageCode,
        ],
        queryFn: () => QuestionersService.getPreTestPageDetails(languageCode),
        enabled: !!languageCode,
    });
}
