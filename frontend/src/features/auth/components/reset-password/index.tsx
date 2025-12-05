import { Box } from '@mui/material';
import type { RootState } from '../../../../store';
import { useSelector } from 'react-redux';
import { useResetPasswordForm } from './hooks/useResetPasswordForm';
import { useResetPasswordSubmit } from './hooks/useResetPasswordSubmit';
import { useCountdownRedirect } from './hooks/useCountdownRedirect';
import MorenCard from '../../../../components/card';
import ModernInput from '../../../../components/input';
import MorenButton from '../../../../components/button';
import CustomLoader from '../../../../components/loader';

const ResetPassword = () => {
  const { loading } = useSelector((state: RootState) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useResetPasswordForm();

  const { onSubmit, success } = useResetPasswordSubmit();
  const timer = useCountdownRedirect(success);

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
