import { useQuery } from '@tanstack/react-query';
import GameApi from '../../../../services/gameApi';

export const useTestAttempts = () => {
    return useQuery({
        queryKey: ['test-attempts'],
        queryFn: () => GameApi.getAttemptStatus(),
        retry: false,
    });
};
