import * as Yup from 'yup';
import { useState } from 'react';
import { Box, Typography, InputAdornment, IconButton } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../../providers/toast-provider';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { useNavigate } from 'react-router-dom';
import { navigateUserTo } from '../../../../utils/functions';
import { ROUTES } from '../../../../router/router';
import ModernInput from '../../../../components/input';
import MorenButton from '../../../../components/button';
import AuthService from '../../auth.service';

type FormValues = {
  email: string;
  password: string;
};

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const PatientLogin = () => {
  const naivgate = useNavigate();
  const { showToast } = useToast();
  const { loading } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const handleNavigation = (path: string) => {
    naivgate(path);
  };

  const onSubmit = async (data: FormValues) => {
    const { success, message, user } = await AuthService.patientLogin(data);
    if (!success) {
      return showToast(message, 'error');
    }

    showToast(message, 'success');
    handleNavigation(navigateUserTo(user));
  };

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
            p: '25px',
          }}
        >
          {/* Left panel - Welcome section */}
          <Box
            sx={{
              flex: 1,
              background:
                'linear-gradient(135deg, #0f7be7 0%, #2563eb 40%, #1d4ed8 100%)',
              borderRadius: 3,
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
              Nice to see you again
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mt: 1, textTransform: 'uppercase' }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 2, maxWidth: 360, opacity: 0.9 }}
            >
              Access your RM360 patient account to continue managing your
              sessions and track your progress.
            </Typography>
          </Box>

          {/* Right panel - Patient login form */}
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
              Patient Login
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 3 }}
            >
              Enter your credentials to continue to your RM360 patient
              dashboard.
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <ModernInput
                label="Email ID"
                placeholder="Enter your email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <ModernInput
                label="Password"
                placeholder="Enter your password"
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

              <Box mt={0.5} display="flex" justifyContent="flex-end">
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ cursor: 'pointer', fontSize: 13 }}
                  onClick={() => handleNavigation(ROUTES.FORGOT_PASSWORD)}
                >
                  Forgot password?
                </Typography>
              </Box>

              <MorenButton
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                Login
              </MorenButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PatientLogin;
