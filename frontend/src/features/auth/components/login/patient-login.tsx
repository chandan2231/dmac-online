import * as Yup from 'yup';
import { Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useToast } from '../../../../providers/toast-provider';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import { useNavigate } from 'react-router-dom';
import { navigateUserTo } from '../../../../utils/functions';
import MorenCard from '../../../../components/card';
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
        minHeight: '80vh',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
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
          <MorenButton type="submit" variant="contained" disabled={loading}>
            Login
          </MorenButton>
        </Box>
      </MorenCard>
    </Box>
  );
};

export default PatientLogin;
