import { get } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentService from '../payment.service';

export const useCreatePayment = (state: string) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const isStateDetailsAvailable = state
      ? get(state, ['product', 'product_amount']) &&
        get(state, ['product', 'product_id']) &&
        get(state, ['user', 'id'])
      : false;

    if (isStateDetailsAvailable) {
      setLoading(true);
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=AUJ2ExPRI7HOoaNHIxWP-3wngxA-Bk_Bxew7RpIUxlLBkJDEyCiSBruQntP3BCYxP3rxMxlm6UZg0zMs&components=buttons`;
      script.onload = () => {
        setLoading(false);
        window.paypal
          .Buttons({
            createOrder: async () => {
              const res = await PaymentService.createPayment(
                get(state, ['product', 'product_amount'])
              );
              if (res.orderId) {
                return res.orderId;
              }
              return '';
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
                amount: get(state, ['product', 'product_amount']),
                userId: get(state, ['user', 'id']),
              };
              const response = await PaymentService.capturePayment(payload);
              if (response) {
                setPaymentSuccess(true);
              }
            },
            onCancel: async () => {
              await PaymentService.cancelPayment();
              setPaymentCancelled(true);
            },
            onError: (err: unknown) => {
              console.error('PayPal Checkout onError', err);
              setPaymentError('An error occurred during the payment process.');
            },
          })
          .render('#paypal-button-container');
      };
      document.body.appendChild(script);
    }
  }, [state, navigate]);

  return { loading, paymentSuccess, paymentCancelled, paymentError };
};
