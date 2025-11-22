import { get } from 'lodash';
import HttpService from '../../services/HttpService';
import type {
  CapturePaymentAdditionClinicSitePayload,
  CapturePaymentPayload,
  CreatePaymentResponse,
} from './payment.interface';

const createPayment = async (
  amount: number
): Promise<CreatePaymentResponse> => {
  try {
    const response = await HttpService.post('/payment/createPayment', {
      amount,
    });
    return {
      success: true,
      approvalUrl: get(response, 'data.approvalUrl'),
      orderId: get(response, 'data.orderID'),
      message: 'Payment created successfully',
    };
  } catch (error: unknown) {
    const message =
      get(error, 'response.data.message') ||
      get(error, 'response.data.error') ||
      'An unexpected error occurred while creating payment';
    return {
      success: false,
      message,
    };
  }
};

const capturePayment = async (payload: CapturePaymentPayload) => {
  try {
    const response = await HttpService.post('/payment/capturePayment', payload);
    return response.data;
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw error;
  }
};

const capturePaymentAdditionClinicSite = async (
  payload: CapturePaymentAdditionClinicSitePayload
) => {
  try {
    const response = await HttpService.post(
      '/payment/capturePaymentAdditionClinicSite',
      payload
    );
    return response.data;
  } catch (error) {
    console.error('Error capturing payment for additional site:', error);
    throw error;
  }
};

const cancelPayment = async () => {
  try {
    const response = await HttpService.post('/payment/cancelPayment', {});
    return response.data;
  } catch (error) {
    console.error('Error cancelling payment:', error);
    throw error;
  }
};

const getPaymentAmountInfo = async (paymentType: string) => {
  try {
    const response = await HttpService.get(
      `/payment/amount-info?paymentType=${paymentType}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting payment amount info:', error);
    throw error;
  }
};

const PaymentService = {
  createPayment,
  capturePayment,
  capturePaymentAdditionClinicSite,
  cancelPayment,
  getPaymentAmountInfo,
};

export default PaymentService;
