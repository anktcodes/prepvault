
import { supabase } from './supabase';

export type RazorpayOrder = {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
};

export type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export async function createPaymentOrder(): Promise<RazorpayOrder> {
  const { data, error } = await supabase.functions.invoke(
    'create-razorpay-order',
    {
      body: {},
    }
  );

  if (error) {
    throw new Error(error.message || 'Could not create payment order');
  }

  if (!data?.order_id || !data?.key_id) {
    throw new Error(data?.error || 'Invalid order response');
  }

  return data as RazorpayOrder;
}

export async function verifyPayment(
  payment: RazorpayPaymentResponse
): Promise<void> {
  const { data, error } = await supabase.functions.invoke(
    'verify-razorpay-payment',
    {
      body: payment,
    }
  );

  if (error) {
    throw new Error(error.message || 'Payment verification failed');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Payment could not be verified');
  }
}
