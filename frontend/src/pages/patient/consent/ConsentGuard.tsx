import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useConsentGuard(allFilled: boolean): void {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!allFilled && location.pathname !== '/consent') {
      alert('Please fill all consent forms before accessing other tabs.');
      navigate('/consent');
    }
  }, [allFilled, location.pathname, navigate]);
}
