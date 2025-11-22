import { get } from 'lodash';
import HttpService from '../../services/HttpService';
import type {
  CapturePaymentPayload,
  CreatePaymentResponse,
} from './payment.interface';

const createPayment = async (
  amount: number
): Promise<CreatePaymentResponse> => {
  try {
    const response = await HttpService.post('/auth/patient/createPayment', {
      amount,
    });
    console.log('responseresponseresponse', response)
    return {
      success: true,
      approvalUrl: get(response, ['data', 'approvalUrl']),
      orderId: get(response, ['data', 'orderId']),
      message: 'Payment created successfully',
    };
  } catch (error: unknown) {
    console.log('errorerror', error)
    const message ='An unexpected error occurred while creating payment';
    return {
      success: false,
      message,
    };
  }
};

const capturePayment = async (payload: CapturePaymentPayload) => {
  try {
    const response = await HttpService.post('/auth/patient/capturePayment', payload);
    return response;
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw error;
  }
};

const cancelPayment = async () => {
  try {
    const response = await HttpService.post('/auth/patient/cancelPayment', {});
    return response;
  } catch (error) {
    console.error('Error cancelling payment:', error);
    throw error;
  }
};

const PaymentService = {
  createPayment,
  capturePayment,
  cancelPayment,
};

export default PaymentService;
