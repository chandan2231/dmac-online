export interface CreatePaymentResponse {
  success: boolean;
  approvalUrl?: string;
  message: string;
  orderId?: string;
  amountToPay?: number;
  isUpgrade?: boolean;
  upgradeFromProductId?: number | null;
  fullProductAmount?: number;
}

export interface CreatePatientPaymentPayload {
  userId: string | number;
  productId: string | number;
}

export interface CapturePaymentPayload {
  orderId: string;
  payerId: string;
  currencyCode: string;
  userId: string | number;
  productId: string | number;
  userName?: string;
  userEmail?: string;
  productName?: string;
  amount?: number; // UI-only; backend recomputes and validates
  upgradeFromProductId?: string | number | null;
}
