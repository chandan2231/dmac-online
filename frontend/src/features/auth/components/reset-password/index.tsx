import { useState } from 'react';
import {
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import type { RootState } from '../../../../store';
import { useSelector } from 'react-redux';
import { useResetPasswordForm } from './hooks/useResetPasswordForm';
import { useResetPasswordSubmit } from './hooks/useResetPasswordSubmit';
import { useCountdownRedirect } from './hooks/useCountdownRedirect';
import ModernInput from '../../../../components/input';
import MorenButton from '../../../../components/button';
import CustomLoader from '../../../../components/loader';

const ResetPassword = () => {
  const { loading } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useResetPasswordForm();

  const { onSubmit, success } = useResetPasswordSubmit();
  const timer = useCountdownRedirect(success);

  if (loading) return <CustomLoader />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 960,
          borderRadius: 3,
          boxShadow: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            height: '100%',
          }}
        >
          {/* Left panel - Info section */}
          <Box
            sx={{
              flex: 1,
              background:
                'linear-gradient(135deg, #0f7be7 0%, #2563eb 40%, #1d4ed8 100%)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              px: { xs: 4, md: 5 },
              py: { xs: 4, md: 6 },
            }}
          >
            <Typography
              variant="overline"
              sx={{ letterSpacing: 1.2, opacity: 0.9 }}
            >
              Reset your password
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mt: 1, textTransform: 'uppercase' }}
            >
              Secure access
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 2, maxWidth: 360, opacity: 0.9 }}
            >
              {success
                ? 'Your password has been updated successfully. You will be redirected shortly.'
                : 'Create a new strong password to keep your RM360 account secure.'}
            </Typography>
          </Box>

          {/* Right panel - Reset password form / success state */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              px: { xs: 4, md: 5 },
              py: { xs: 4, md: 6 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2.5,
              }}
            >
              <img
                src="/RM360-LOGO.png"
                alt="RM360 Logo"
                style={{ height: 150, width: 'auto' }}
              />
            </Box>

            <Typography
              variant="h6"
              sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5 }}
            >
              Reset Password
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 3 }}
            >
              {success
                ? `Password successfully reset. Redirecting in ${timer} seconds...`
                : 'Enter your new password below.'}
            </Typography>

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
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? 'Hide password' : 'Show password'
                          }
                          onClick={() => setShowPassword(prev => !prev)}
                          edge="end"
                          size="small"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <ModernInput
                  label="Confirm Password"
                  placeholder="Confirm new password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showConfirmPassword
                              ? 'Hide confirm password'
                              : 'Show confirm password'
                          }
                          onClick={() =>
                            setShowConfirmPassword(prev => !prev)
                          }
                          edge="end"
                          size="small"
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <MorenButton type="submit" variant="contained" fullWidth>
                  Reset Password
                </MorenButton>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;
