import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../../../router/router';

export const useCountdownRedirect = (
  shouldRedirect: boolean,
  delay: number = 10
) => {
  const [timer, setTimer] = useState(delay);
  const navigate = useNavigate();

  const countdown = useCallback(() => {
    setTimer(t => t - 1);
  }, []);

  useEffect(() => {
    if (shouldRedirect && timer > 0) {
      const timeout = setTimeout(countdown, 1000);
      return () => clearTimeout(timeout);
    }

    if (timer === 0) {
      navigate(ROUTES.LOGIN);
    }
  }, [shouldRedirect, timer, countdown, navigate]);

  return timer;
};
