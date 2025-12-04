import axios from 'axios';
import { purgeLocalStorage } from '../utils/functions';
import { persistor, store } from '../store';
import { get } from 'lodash';
import { ROUTES } from '../router/router';

const TIMEOUT = 30000;
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const _axios = axios.create({
  timeout: TIMEOUT,
  baseURL: BASE_URL,
});

_axios.interceptors.request.use(
  config => {
    const state = store.getState();
    const token = get(state, ['auth', 'token'], null);

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

_axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const status = get(error, ['response', 'status'], null);
    const message = get(error, ['response', 'data', 'message'], null);
    if (status === 404 && message === 'Invalid or expired token.') {
      persistor.flush();
      purgeLocalStorage();
      window.location.replace(ROUTES.LOGIN);
    }

    return Promise.reject(error);
  }
);

const getAxiosClient = () => _axios;

const HttpService = {
  getAxiosClient,
  get: getAxiosClient().get,
  post: getAxiosClient().post,
  put: getAxiosClient().put,
  patch: getAxiosClient().patch,
  delete: getAxiosClient().delete,
};

export default HttpService;
