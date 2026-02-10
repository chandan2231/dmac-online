import { get } from 'lodash';
import HttpService from '../../services/HttpService';

export type PartnerUsersSummary = {
  allowed_users: number;
  active_users: number;
  remaining_users: number;
  price_per_user?: number;
};

export type PartnerUserRow = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  country: string;
  state: string;
  zip_code: string;
  language_name?: string;
  language?: string;
  province_title?: string;
  province_id?: string;
  time_zone?: string;
  weight?: number;
  weight_unit?: string;
  height?: number;
  height_unit?: string;
  status?: number;
  verified?: number;
};

export type CreatePartnerUserSlotsPaymentResponse = {
  success: boolean;
  orderId?: string;
  amountToPay?: number;
  unitPrice?: number;
  addedUsers?: number;
  message?: string;
};

const PartnerPortalService = {
  async fetchConsentSignatures(): Promise<string[]> {
    const res = await HttpService.post<{ signatures: string[] }>(
      '/partner-portal/consent/status',
      {}
    );
    return (get(res, ['data', 'signatures'], ['', '', '']) as string[]).map(
      s => String(s ?? '')
    );
  },

  async saveConsentSignatures(signatures: string[]): Promise<{ success: boolean } | unknown> {
    const res = await HttpService.post('/partner-portal/consent/sign', {
      signatures,
    });
    return get(res, 'data');
  },

  async getUsersSummary(): Promise<PartnerUsersSummary> {
    const res = await HttpService.post<PartnerUsersSummary>(
      '/partner-portal/users/summary',
      {}
    );
    return {
      allowed_users: Number(get(res, ['data', 'allowed_users'], 0)),
      active_users: Number(get(res, ['data', 'active_users'], 0)),
      remaining_users: Number(get(res, ['data', 'remaining_users'], 0)),
      price_per_user: Number(get(res, ['data', 'price_per_user'], 0)),
    };
  },

  async listUsers(): Promise<PartnerUserRow[]> {
    const res = await HttpService.post<PartnerUserRow[]>('/partner-portal/users/list', {});
    return (get(res, 'data', []) as PartnerUserRow[]) ?? [];
  },

  async createUser(payload: Record<string, unknown>): Promise<{ success: boolean; message?: string } & Record<string, unknown>> {
    const res = await HttpService.post('/partner-portal/users/create', payload);
    return get(res, 'data');
  },

  async updateUser(payload: Record<string, unknown>): Promise<{ success: boolean; message?: string } & Record<string, unknown>> {
    const res = await HttpService.post('/partner-portal/users/update', payload);
    return get(res, 'data');
  },

  async changeUserPassword(payload: { id: number; new_password: string }): Promise<{ success: boolean; message?: string } & Record<string, unknown>> {
    const res = await HttpService.post('/partner-portal/users/password/change', payload);
    return get(res, 'data');
  },

  async createUserSlotsPayment(payload: { usersToAdd: number }): Promise<CreatePartnerUserSlotsPaymentResponse> {
    try {
      const res = await HttpService.post('/partner-portal/users/purchase/createPayment', payload);
      return {
        success: Boolean(get(res, ['data', 'success'], true)),
        orderId: String(get(res, ['data', 'orderId'], '')),
        amountToPay: Number(get(res, ['data', 'amountToPay'], 0)),
        unitPrice: Number(get(res, ['data', 'unitPrice'], 19.99)),
        addedUsers: Number(get(res, ['data', 'addedUsers'], payload.usersToAdd)),
      };
    } catch {
      const message = 'An unexpected error occurred while creating payment';
      return { success: false, message };
    }
  },

  async captureUserSlotsPayment(payload: { orderId: string; payerId: string; currencyCode: string }): Promise<{ success: boolean; message?: string } & Record<string, unknown>> {
    const res = await HttpService.post('/partner-portal/users/purchase/capturePayment', payload);
    return get(res, 'data');
  },

  async cancelUserSlotsPayment(payload: { orderId: string; reason?: string }): Promise<{ success: boolean } & Record<string, unknown>> {
    const res = await HttpService.post('/partner-portal/users/purchase/cancelPayment', payload);
    return get(res, 'data');
  },
};

export default PartnerPortalService;
