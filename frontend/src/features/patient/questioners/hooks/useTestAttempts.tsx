import { useQuery } from '@tanstack/react-query';
import GameApi from '../../../../services/gameApi';

export const useTestAttempts = (languageCode: string = 'en') => {
    return useQuery({
        queryKey: ['test-attempts', languageCode],
        queryFn: () => GameApi.getAttemptStatus(languageCode),
        retry: false,
    });
};
