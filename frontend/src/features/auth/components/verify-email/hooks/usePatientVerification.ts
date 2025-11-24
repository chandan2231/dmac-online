import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../../../../providers/toast-provider';
import { ROUTES } from '../../../../../router/router';
import AuthService from '../../../auth.service';

export const usePatientEmailVerification = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const payload = { token: String(token) };
        const response = await AuthService.getPatientEmailVerification(payload);
        const { success, message } = response;

        if (success) {
          setMessage(message || 'Email verified successfully!');
          showToast('Email verified successfully!', 'success');
          navigate(ROUTES.PATIENT_PAYMENT, { state: { ...response } });
        } else {
          setMessage(message || 'Email verification failed.');
          showToast(message || 'Email verification failed.', 'error');
        }
      } catch (error) {
        console.error('Email verification error:', error);
        setMessage('An error occurred while verifying your email.');
        showToast('An error occurred while verifying your email.', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate, showToast]); // removed loading

  return { loading, message };
};
