'use client';

import { useState, useEffect, Suspense } from 'react';
import { Navbar } from '@/components/Navbar';
import { apiRequest } from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';
interface Tier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'monthly' | 'annual';
  features?: {
    teamManagement?: boolean;
  };
}

function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierId = searchParams.get('tier');

  const [tier, setTier] = useState<Tier | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        const selectedTier = tiers.find(t => t.id === tierId || t.name === tierId);

        if (!selectedTier) {
          setError('Invalid tier selected');
        } else {
          setTier(selectedTier);
          // Default to 5 seats for corporate
          if (selectedTier.features?.teamManagement) {
            setQuantity(5);
          }
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

  // Calculate total price
  const totalPrice = tier ? tier.price * quantity : 0;
  const isCorporate = tier?.features?.teamManagement;

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
              <span className="text-md-on-surface font-medium capitalize">
                {tier?.billingPeriod}
              </span>
            </div>

            {/* Quantity selector for Corporate */}
            {isCorporate && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-md-on-surface-variant">Seats</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-md-surface-variant flex items-center justify-center text-md-on-surface-variant hover:bg-md-outline"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-md-on-surface font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="w-8 h-8 rounded-full bg-md-surface-variant flex items-center justify-center text-md-on-surface-variant hover:bg-md-outline"
                    disabled={quantity >= 100}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center text-xl font-bold border-t border-md-outline pt-2 mt-2">
              <span className="text-md-on-surface-variant">
                {isCorporate ? `Total (${quantity} seat${quantity > 1 ? 's' : ''})` : 'Total'}
              </span>
              <span className="text-md-primary">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-md-error-container rounded-lg text-md-on-error-container text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Stripe Button */}
          <button
            onClick={async () => {
              try {
                setLoading(true);
                const response = await apiRequest<{ checkoutUrl: string }>(
                  '/subscriptions/stripe/checkout',
                  {
                    method: 'POST',
                    body: {
                      tierId: tier?.id,
                      quantity: isCorporate ? quantity : undefined,
                    },
                  }
                );
                if (response.data?.checkoutUrl) {
                  window.location.href = response.data.checkoutUrl;
                } else {
                  throw new Error('No checkout URL returned');
                }
              } catch (err) {
                console.error('Stripe checkout failed:', err);
                setError('Failed to initiate Stripe checkout. Please try again.');
                setLoading(false);
              }
            }}
            disabled={loading || !tier}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mb-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Pay with Credit Card</span>
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
            </svg>
          </button>

          <p className="text-xs text-center text-md-on-surface-variant mt-4">
            By checking out, you agree to our Terms of Service.
            <br />
            Payments are securely processed by Stripe.
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
