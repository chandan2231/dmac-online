import HttpService from './HttpService';

export type ScreeningRegisterPayload = {
  name: string;
  email: string;
  age: number;
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

export type ScreeningUserStatusResponse = {
  isSuccess: boolean;
  message?: string;
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

const getUserStatus = async (userId: number): Promise<ScreeningUserStatusResponse> => {
  const res = await HttpService.get('/screeningModules/user/status', {
    params: { user_id: userId },
  });
  return res.data;
};

const ScreeningAuthApi = {
  register,
  verifyEmail,
  getUserStatus,
};

export default ScreeningAuthApi;
