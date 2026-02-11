import HttpService from './HttpService';

export type ScreeningRegisterPayload = {
  name: string;
  email: string;
  dob: string;
};

export type ScreeningRegisterResponse = {
  isSuccess: boolean;
  message: string;
  userId?: number | null;
};

export type ScreeningVerifyResponse = {
  isSuccess: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    patient_meta?: string | null;
    verified: boolean;
  };
};

const register = async (payload: ScreeningRegisterPayload): Promise<ScreeningRegisterResponse> => {
  const res = await HttpService.post('/screeningModules/register', payload);
  return res.data;
};

const verifyEmail = async (token: string): Promise<ScreeningVerifyResponse> => {
  const res = await HttpService.post('/screeningModules/verify-email', { token });
  return res.data;
};

const ScreeningAuthApi = {
  register,
  verifyEmail,
};

export default ScreeningAuthApi;
