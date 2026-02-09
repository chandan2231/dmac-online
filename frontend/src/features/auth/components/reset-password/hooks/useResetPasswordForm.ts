import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

const schema = Yup.object({
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Passwords must match')
    .required('Please confirm your password'),
});

export const useResetPasswordForm = () => {
  return useForm<ResetPasswordFormValues>({
    resolver: yupResolver(schema),
  });
};
