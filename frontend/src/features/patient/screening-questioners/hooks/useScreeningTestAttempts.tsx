import { useQuery } from '@tanstack/react-query';
import ScreeningGameApi from '../../../../services/screeningGameApi';

export const useScreeningTestAttempts = (
  userId: number,
  languageCode: string = 'en'
) => {
  return useQuery({
    queryKey: ['screening-test-attempts', userId, languageCode],
    queryFn: () => ScreeningGameApi.getAttemptStatus(userId, languageCode),
    enabled: Boolean(userId),
    retry: false,
  });
};
