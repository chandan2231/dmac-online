export interface CreatePaymentResponse {
  success: boolean;
  approvalUrl?: string;
  message: string;
  orderId?: string;
}

export interface CapturePaymentPayload {
  orderId: string;
  payerId: string;
  currencyCode: string;
  amount: number;
  userId: string;
}

export interface CapturePaymentAdditionClinicSitePayload
  extends CapturePaymentPayload {
  protocolCount: number;
}
