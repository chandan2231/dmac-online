import HttpService from './HttpService';
import type {
  AttemptStatus,
  Module,
  SessionData,
  SubmitPayload,
  SubmitResponse,
} from './gameApi';

const getModules = async (): Promise<{ modules: Module[] }> => {
  const res = await HttpService.get('/screeningModules');
  return res.data;
};

const startSession = async (
  moduleId: number,
  userId: number,
  languageCode: string,
  resume?: boolean
): Promise<SessionData> => {
  const res = await HttpService.post(`/screeningModules/${moduleId}/session/start`, {
    user_id: userId,
    language_code: languageCode,
    resume,
  });
  return res.data;
};

const submitSession = async (
  moduleId: number,
  sessionId: number,
  payload: SubmitPayload
): Promise<SubmitResponse> => {
  const res = await HttpService.post(
    `/screeningModules/${moduleId}/session/${sessionId}/submit`,
    payload
  );
  return res.data;
};

const getAttemptStatus = async (
  userId: number,
  languageCode: string = 'en'
): Promise<AttemptStatus> => {
  const res = await HttpService.get(
    `/screeningModules/attempts?language=${languageCode}&user_id=${userId}`
  );
  return res.data;
};

const getReportPdf = async (userId: number) => {
  const res = await HttpService.post(
    '/screeningModules/report/pdf',
    { user_id: userId },
    { responseType: 'blob' }
  );
  return res.data;
};

const ScreeningGameApi = {
  getModules,
  startSession,
  submitSession,
  getAttemptStatus,
  getReportPdf,
};

export default ScreeningGameApi;
