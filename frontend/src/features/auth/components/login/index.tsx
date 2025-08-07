import * as Yup from 'yup';
import type { RootState } from '../../../../store/index.ts';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../auth.interface.ts';
import { useSelector } from 'react-redux';
import { useToast } from '../../../../providers/toast-provider';
import MorenButton from '../../../../components/button';
import ModernInput from '../../../../components/input';
import MorenCard from '../../../../components/card/index.tsx';
import AuthService from '../../auth.service.ts';
import CustomLoader from '../../../../components/loader/index.tsx';

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

const Login = () => {
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
    const { success, message } = await AuthService.loginUser(data);
    if (!success) {
      return showToast(message, 'error');
    }

    showToast(message, 'success');
    handleNavigation(ROUTES.HOME);
  };

  if (loading) return <CustomLoader />;

  return (
    <MorenCard
      title="Login"
      description="Enter your credentials to continue"
      maxWidth={480}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <ModernInput
          label="Email"
          placeholder="Enter your email"
          type="email"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <ModernInput
          label="Password"
          placeholder="Enter your password"
          type="password"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <MorenButton
          showGlanceEffect
          type="submit"
          variant="contained"
          disabled={loading}
        >
          Login
        </MorenButton>
      </Box>

      <Box mt={2} textAlign="center" display="flex" flexDirection="row" gap={1}>
        <MorenButton
          variant="text"
          onClick={() => handleNavigation(ROUTES.REGISTER)}
        >
          Not a member? Sign Up
        </MorenButton>

        <MorenButton
          variant="text"
          onClick={() => handleNavigation(ROUTES.FORGOT_PASSWORD)}
        >
          Forgot Password?
        </MorenButton>
      </Box>
    </MorenCard>
  );
};

export default Login;
