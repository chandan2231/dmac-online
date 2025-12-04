import { useEffect, useState } from 'react';

const useTimer = (delay: number): boolean => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return ready;
};

export default useTimer;
