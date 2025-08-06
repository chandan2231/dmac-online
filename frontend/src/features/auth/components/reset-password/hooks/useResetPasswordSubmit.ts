import { useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { useToast } from '../../../../../providers/toast-provider';
import AuthService from '../../../auth.service';

export const useResetPasswordSubmit = () => {
  const { token } = useParams();
  const { showToast } = useToast();
  const [success, setSuccess] = useState(false);

  const onSubmit = useCallback(
    async (data: { password: string }) => {
      if (!token) {
        showToast('Invalid or missing token', 'error');
        return;
      }

      const { success, message } = await AuthService.resetPassword({
        password: data.password,
        token,
      });

      if (!success) {
        showToast(message, 'error');
        return;
      }

      showToast(message, 'success');
      setSuccess(true);
    },
    [token, showToast]
  );

  return { onSubmit, success };
};
