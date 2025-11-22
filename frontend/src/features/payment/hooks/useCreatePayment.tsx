import { get } from 'lodash';
import { useEffect, useState } from 'react';

export const useCreatePayment = (state: unknown) => {
  const [loading, setLoading] = useState(true);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!state) {
      setLoading(false);
      return;
    }

    const productAmount = get(state, ['product', 'product_amount']);
    const productId = get(state, ['product', 'product_id']);
    const userId = get(state, ['user', 'id']);
    const userName = get(state, ['user', 'name']);
    const productName = get(state, ['product', 'product_name']);

    const valid =
      productAmount && productId && userId && userName && productName;
    if (!valid) {
      setLoading(false);
      return;
    }

    // --- LOAD PAYPAL SCRIPT ONLY ONCE ---
    if (!document.getElementById('paypal-sdk')) {
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${
        import.meta.env.VITE_PAYPAL_CLIENT_ID
      }&components=buttons`;

      script.onload = () => setScriptReady(true);

      document.body.appendChild(script);
    } else {
      setScriptReady(true);
    }

    setLoading(false);
  }, [state]);

  return { loading, scriptReady };
};
