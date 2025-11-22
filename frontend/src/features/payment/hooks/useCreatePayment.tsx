import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../payment.service';
import { ROUTES } from '../../auth/auth.interface';

export const useCreatePayment = (state: string) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) return;

    const productAmount = get(state, ['product', 'product_amount']);
    const productId = get(state, ['product', 'product_id']);
    const userId = get(state, ['user', 'id']);

    // --- VALIDATION ---
    const valid = productAmount && productId && userId;
    if (!valid) return;

    setLoading(true);

    // --- PAYPAL SCRIPT ---
    const PAYPAL_ENV = import.meta.env.VITE_PAYPAL_ENV;
    const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    const clientId = PAYPAL_ENV === 'sandbox' ? PAYPAL_CLIENT_ID : '';

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons`;
    script.onload = () => {
      setLoading(false);

      window.paypal
        .Buttons({
          createOrder: async () => {
            try {
              const response =
                await PaymentService.createPayment(productAmount);
              if (response?.orderId) {
                return response.orderId; // Use backend orderId
              } else {
                throw new Error('Order ID not found in backend response.');
              }
            } catch (error) {
              console.error('Error creating PayPal order:', error);
            }
          },

          onApprove: async (data: unknown) => {
            const { orderID, payerID } = data as {
              orderID: string;
              payerID: string;
            };
            const payload = {
              orderId: orderID,
              payerId: payerID,
              currencyCode: 'USD',
              amount: productAmount,
              userId: userId,
              productId: productId,
            };

            const response = await PaymentService.capturePayment(payload);

            if (response) {
              navigate(ROUTES.PATIENT_PAYMENT_SUCCESS);
            }
          },

          onCancel: async () => {
            await PaymentService.cancelPayment();
            navigate(ROUTES.PATIENT_PAYMENT_CANCELLED);
          },

          onError: (err: unknown) => {
            console.error('PayPal Checkout Error:', err);
          },
        })
        .render('#paypal-button-container');
    };

    document.body.appendChild(script);
  }, [navigate, state]);

  return { loading };
};
