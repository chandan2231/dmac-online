import * as Yup from 'yup';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../../providers/toast-provider/index.tsx';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ROUTES } from '../../auth.interface.ts';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store/index.ts';
import MorenCard from '../../../../components/card/index.tsx';
import ModernInput from '../../../../components/input/index.tsx';
import MorenButton from '../../../../components/button/index.tsx';
import AuthService from '../../auth.service.ts';
import CustomLoader from '../../../../components/loader/index.tsx';

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
};

const schema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
  mobile: Yup.string()
    .matches(/^\d{10}$/, 'Mobile number must be 10 digits')
    .required('Mobile number is required'),
});

const Register = () => {
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
    const { ...payload } = data;

    const { success, message } = await AuthService.registerUser(payload);

    if (!success) {
      return showToast(message, 'error');
    }

    showToast(message, 'success');
    handleNavigation(ROUTES.HOME);
  };

  if (loading) {
    return <CustomLoader />;
  }

  return (
    <MorenCard
      title="Register"
      description="Enter your details to create an account"
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
          label="Name"
          placeholder="Enter your name"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />
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
        <ModernInput
          label="Confirm Password"
          placeholder="Confirm your password"
          type="password"
          {...register('confirmPassword')}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <ModernInput
          label="Mobile"
          placeholder="Enter your mobile number"
          {...register('mobile')}
          error={!!errors.mobile}
          helperText={errors.mobile?.message}
        />
        <MorenButton type="submit" variant="contained" disabled={loading}>
          Register
        </MorenButton>
      </Box>

      <Box mt={2} textAlign="center" display="flex" flexDirection="row" gap={1}>
        <MorenButton
          variant="text"
          onClick={() => handleNavigation(ROUTES.LOGIN)}
        >
          Do you have an account? Login
        </MorenButton>
      </Box>
    </MorenCard>
  );
};

export default Register;
