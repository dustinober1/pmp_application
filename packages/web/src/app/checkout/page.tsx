'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Script from 'next/script';
import { Navbar } from '@/components/Navbar';
import { apiRequest } from '../../lib/api';

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: { layout?: string; color?: string; shape?: string; label?: string };
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onError?: (err: Error) => void;
        onCancel?: () => void;
      }) => { render: (selector: string) => void };
    };
  }
}

interface Tier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'annual';
}

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierId = searchParams.get('tier');

  const [tier, setTier] = useState<Tier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paypalReady, setPaypalReady] = useState(false);

  // Fetch tier details
  useEffect(() => {
    async function fetchTier() {
      if (!tierId) {
        setError('No tier selected');
        setLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ tiers: Tier[] }>('/subscriptions/tiers');
        const tiers = response.data?.tiers || [];
        const selectedTier = tiers.find((t) => t.id === tierId || t.name === tierId);

        if (!selectedTier) {
          setError('Invalid tier selected');
        } else {
          setTier(selectedTier);
        }
      } catch (err) {
        console.error('Failed to fetch tier:', err);
        setError('Failed to load pricing information');
      } finally {
        setLoading(false);
      }
    }

    fetchTier();
  }, [tierId]);

  // Initialize PayPal buttons when SDK is ready
  useEffect(() => {
    if (!paypalReady || !tier || !window.paypal) return;

    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (!paypalButtonContainer) return;

    // Clear any existing buttons
    paypalButtonContainer.innerHTML = '';

    window.paypal
      .Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
        },
        createOrder: async () => {
          try {
            const response = await apiRequest<{
              paypalOrder: { orderId: string; approvalUrl: string };
            }>('/subscriptions/create', {
              method: 'POST',
              body: { tierId: tier.id },
            });

            if (!response.data?.paypalOrder?.orderId) {
              throw new Error('Failed to create order');
            }

            return response.data.paypalOrder.orderId;
          } catch (err) {
            console.error('Create order failed:', err);
            setError('Failed to create payment. Please try again.');
            throw err;
          }
        },
        onApprove: async (data) => {
          try {
            setLoading(true);
            await apiRequest('/subscriptions/activate', {
              method: 'POST',
              body: {
                paypalOrderId: data.orderID,
                tierId: tier.id,
              },
            });

            router.push('/dashboard?payment=success');
          } catch (err) {
            console.error('Activate subscription failed:', err);
            setError('Payment completed but activation failed. Please contact support.');
            setLoading(false);
          }
        },
        onError: (err) => {
          console.error('PayPal error:', err);
          setError('Payment failed. Please try again.');
        },
        onCancel: () => {
          setError('Payment was cancelled.');
        },
      })
      .render('#paypal-button-container');
  }, [paypalReady, tier, router]);

  if (loading && !tier) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error && !tier) {
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => router.push('/pricing')} className="btn btn-primary">
          Back to Pricing
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=USD`}
        onLoad={() => setPaypalReady(true)}
        onError={() => setError('Failed to load PayPal. Please refresh the page.')}
      />

      <div className="max-w-lg mx-auto bg-md-surface-container rounded-2xl shadow-xl overflow-hidden border border-md-outline/20">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-md-on-surface mb-6">Complete your purchase</h2>

          <div className="bg-md-surface-container-high rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-md-on-surface-variant">Plan</span>
              <span className="text-md-on-surface font-medium capitalize">
                {tier?.name.replace('-', ' ')}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-md-on-surface-variant">Billing</span>
              <span className="text-md-on-surface font-medium capitalize">{tier?.billingPeriod}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-md-on-surface-variant">Total</span>
              <span className="text-md-primary">${tier?.price.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-md-error-container rounded-lg text-md-on-error-container text-sm">
              {error}
            </div>
          )}

          {loading && tier && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* PayPal Button Container */}
          <div
            id="paypal-button-container"
            className={loading ? 'opacity-50 pointer-events-none' : ''}
          ></div>

          <p className="text-xs text-center text-md-on-surface-variant mt-4">
            By checking out, you agree to our Terms of Service.
            <br />
            Payments are securely processed by PayPal.
          </p>
        </div>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-md-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          }
        >
          <CheckoutForm />
        </Suspense>
      </main>
    </div>
  );
}
