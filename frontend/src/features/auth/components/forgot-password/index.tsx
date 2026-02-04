import * as Yup from 'yup';
import { Box, Typography, InputAdornment } from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../providers/toast-provider/index.tsx';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { RootState } from '../../../../store/index.ts';
import { ROUTES } from '../../../../router/router.ts';
import ModernInput from '../../../../components/input/index.tsx';
import MorenButton from '../../../../components/button/index.tsx';
import CustomLoader from '../../../../components/loader/index.tsx';
import AuthService from '../../auth.service.ts';

type FormValues = {
  email: string;
};

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
  const naivgate = useNavigate();
  const { showToast } = useToast();
  const { loading } = useSelector((state: RootState) => state.auth);

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
    const { success, message } = await AuthService.forgotPassword(data);
    if (!success) {
      return showToast(message, 'error');
    }

    showToast(message, 'success');
  };

  if (loading) {
    return <CustomLoader />;
  }

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
          {/* Left panel - Info section */}
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
              Forgot your password?
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700, mt: 1, textTransform: 'uppercase' }}
            >
              Reset access
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 2, maxWidth: 360, opacity: 0.9 }}
            >
              Enter the email associated with your RM360 account and we will
              send you a link to reset your password.
            </Typography>
          </Box>

          {/* Right panel - Forgot password form */}
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
              Forgot Password
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mb: 3 }}
            >
              Enter your email to receive a password reset link.
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

              <MorenButton
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                Submit
              </MorenButton>
            </Box>

            <Box mt={2} display="flex" justifyContent="flex-end">
              <Typography
                variant="body2"
                color="primary.main"
                sx={{ cursor: 'pointer' }}
                onClick={() => handleNavigation(ROUTES.LOGIN)}
              >
                Already have an account? Sign in
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
