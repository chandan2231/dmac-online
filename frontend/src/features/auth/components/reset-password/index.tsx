import * as Yup from 'yup';
import { Box } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../../../providers/toast-provider/index.tsx';
import { ROUTES } from '../../auth.interface.ts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/index.ts';
import MorenCard from '../../../../components/card/index.tsx';
import ModernInput from '../../../../components/input/index.tsx';
import MorenButton from '../../../../components/button/index.tsx';
import CustomLoader from '../../../../components/loader/index.tsx';
import AuthService from '../../auth.service.ts';

type FormValues = {
  password: string;
  confirmPassword: string;
};

const schema = Yup.object({
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { showToast } = useToast();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [success, setSuccess] = useState(false);
  const [timer, setTimer] = useState(10);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
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
  };

  // Redirect to login after 10 seconds
  const countdown = useCallback(() => {
    setTimer(t => t - 1);
  }, []);

  useEffect(() => {
    if (success && timer > 0) {
      const timeout = setTimeout(countdown, 1000);
      return () => clearTimeout(timeout);
    }

    if (timer === 0) {
      navigate(ROUTES.LOGIN);
    }
  }, [success, timer, countdown, navigate]);

  if (loading) return <CustomLoader />;

  return (
    <MorenCard
      title="Reset Password"
      description={
        success
          ? `Password successfully reset. Redirecting in ${timer} seconds...`
          : 'Enter your new password below'
      }
      maxWidth={480}
    >
      {!success && (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          display="flex"
          flexDirection="column"
          gap={2}
        >
          <ModernInput
            label="New Password"
            placeholder="Enter new password"
            type="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <ModernInput
            label="Confirm Password"
            placeholder="Confirm new password"
            type="password"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <MorenButton type="submit" variant="contained">
            Reset Password
          </MorenButton>
        </Box>
      )}
    </MorenCard>
  );
};

export default ResetPassword;
