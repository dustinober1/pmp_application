'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiRequest } from '../../lib/api';

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierId = searchParams.get('tier') || 'high-end';

  // Mock prices - in real app fetch from API
  const priceMap: Record<string, number> = {
    'high-end': 29,
    corporate: 99,
  };

  const price = priceMap[tierId] || 29;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      // STEP 1: In a real app, this would call backend to create a PayPal Order
      // const order = await apiRequest('/subscriptions/create-order', { method: 'POST', body: { tierId } });

      // STEP 2: For MVP/Mock, we'll simulate a successful "Free Trial" or "Mock Payment" upgrade
      // This endpoint mimics the webhook that would be called by PayPal
      await apiRequest('/subscriptions/upgrade-tier', {
        method: 'POST',
        body: {
          tierId,
          paymentId: `mock_pay_${Date.now()}`, // Simulate payment reference
        },
      });

      // Redirect to success
      router.push('/dashboard?payment=success');
    } catch (err: any) {
      console.error('Checkout failed', err);
      setError('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Complete your purchase</h2>

        <div className="bg-gray-900/50 rounded-lg p-4 mb-6 border border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Plan</span>
            <span className="text-white font-medium capitalize">{tierId.replace('-', ' ')}</span>
          </div>
          <div className="flex justify-between items-center text-xl font-bold">
            <span className="text-gray-400">Total</span>
            <span className="text-primary-400">${price}.00</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Mock PayPal Button */}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 bg-[#FFC439] hover:bg-[#F4BB2E] text-blue-900 font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span className="italic font-serif font-bold text-lg">Pay</span>
                <span className="italic font-serif font-bold text-lg text-[#003087]">Pal</span>
              </>
            )}
          </button>

          <p className="text-xs text-center text-gray-500 mt-4">
            By checking out, you agree to our Terms of Service.
            <br />
            (This is a secure mock payment for the demo environment)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-white">Loading checkout...</div>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
