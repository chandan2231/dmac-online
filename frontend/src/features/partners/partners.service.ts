import { get } from 'lodash';
import moment from 'moment';
import HttpService from '../../services/HttpService';
import type {
  IChangePartnerPasswordPayload,
  ICreatePartnerPayload,
  IPartner,
  IPartnerAllowedUsersAddition,
  IAddMorePartnerUsersPayload,
  IUpdatePartnerPayload,
} from './partners.interface';

const getPartnersList = async (): Promise<{
  success: boolean;
  data: IPartner[];
  message: string;
}> => {
  try {
    const response = await HttpService.post('/partner/list', {});
    const rows = (get(response, 'data', []) as IPartner[]).map(item => ({
      ...item,
      active_users: Number(get(item, 'active_users', 0)),
      remaining_users: Number(get(item, 'remaining_users', 0)),
      allowed_users: Number(get(item, 'allowed_users', 0)),
      status: Number(get(item, 'status', 0)),
      created_date: get(item, 'created_date')
        ? moment(get(item, 'created_date')).format('YYYY-MM-DD')
        : null,
    }));

    return {
      success: true,
      data: rows,
      message: 'Partners fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while fetching partners';

    return {
      success: false,
      data: [],
      message,
    };
  }
};

const createPartner = async (
  payload: ICreatePartnerPayload
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await HttpService.post('/partner/create', payload);
    return {
      success: true,
      message:
        get(response, ['data', 'msg']) ||
        get(response, ['data', 'message'], 'Partner created successfully'),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      get(error, 'response.data') ||
      'An unexpected error occurred while creating partner';

    return {
      success: false,
      message: String(message),
    };
  }
};

const changePartnerStatus = async (
  id: number,
  status: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await HttpService.post('/partner/status/change', {
      id,
      status,
    });

    return {
      success: true,
      message:
        get(response, ['data', 'msg']) ||
        get(response, ['data', 'message'], 'Status updated successfully'),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while updating status';

    return {
      success: false,
      message,
    };
  }
};

const updatePartner = async (
  payload: IUpdatePartnerPayload
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await HttpService.post('/partner/update', payload);
    return {
      success: true,
      message:
        get(response, ['data', 'msg']) ||
        get(response, ['data', 'message'], 'Partner updated successfully'),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      get(error, 'response.data') ||
      'An unexpected error occurred while updating partner';

    return {
      success: false,
      message: String(message),
    };
  }
};

const changePartnerPassword = async (
  payload: IChangePartnerPasswordPayload
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await HttpService.post('/partner/password/change', payload);
    return {
      success: true,
      message:
        get(response, ['data', 'msg']) ||
        get(
          response,
          ['data', 'message'],
          'Partner password updated successfully'
        ),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      get(error, 'response.data') ||
      'An unexpected error occurred while updating password';

    return {
      success: false,
      message: String(message),
    };
  }
};

const addMorePartnerUsers = async (
  payload: IAddMorePartnerUsersPayload
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await HttpService.post('/partner/allowed-users/add', payload);
    return {
      success: true,
      message:
        get(response, ['data', 'msg']) ||
        get(response, ['data', 'message'], 'Allowed users updated successfully'),
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      get(error, 'response.data') ||
      'An unexpected error occurred while updating allowed users';

    return {
      success: false,
      message: String(message),
    };
  }
};

const getPartnerAddedUsersHistory = async (
  partner_id: number
): Promise<{ success: boolean; data: IPartnerAllowedUsersAddition[]; message: string }> => {
  try {
    const response = await HttpService.post('/partner/allowed-users/history', {
      partner_id,
    });

    const rows = (get(response, 'data.data', []) as IPartnerAllowedUsersAddition[]).map(
      item => ({
        ...item,
        added_date: get(item, 'added_date')
          ? moment(get(item, 'added_date')).format('YYYY-MM-DD')
          : '',
      })
    );
    return {
      success: true,
      data: rows || [],
      message: 'History fetched successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      get(error, 'response.data') ||
      'An unexpected error occurred while fetching history';

    return {
      success: false,
      data: [],
      message: String(message),
    };
  }
};

const PartnerService = {
  getPartnersList,
  createPartner,
  changePartnerStatus,
  updatePartner,
  changePartnerPassword,
  addMorePartnerUsers,
  getPartnerAddedUsersHistory,
};

export default PartnerService;
