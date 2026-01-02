import { env } from '../config/env';
import { logger } from '../utils/logger';

const PAYPAL_API_BASE =
    env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

interface PayPalAccessToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface PayPalOrderLink {
    href: string;
    rel: string;
    method: string;
}

interface PayPalOrder {
    id: string;
    status: string;
    links: PayPalOrderLink[];
}

interface PayPalCaptureResult {
    id: string;
    status: string;
    purchase_units: Array<{
        payments: {
            captures: Array<{
                id: string;
                status: string;
                amount: { value: string; currency_code: string };
            }>;
        };
    }>;
}

// Cache token in memory with expiry
let cachedToken: { token: string; expiresAt: number } | null = null;

export class PayPalService {
    /**
     * Get an OAuth2 access token from PayPal.
     * Caches the token in memory to reduce API calls.
     */
    async getAccessToken(): Promise<string> {
        // Return cached token if still valid (with 60s buffer)
        if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
            return cachedToken.token;
        }

        const clientId = env.PAYPAL_CLIENT_ID;
        const clientSecret = env.PAYPAL_CLIENT_SECRET;

        if (!clientId || !clientSecret) {
            throw new Error('PayPal credentials not configured');
        }

        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`PayPal OAuth failed: ${response.status} ${errorText}`);
            throw new Error('Failed to obtain PayPal access token');
        }

        const data = (await response.json()) as PayPalAccessToken;

        // Cache the token
        cachedToken = {
            token: data.access_token,
            expiresAt: Date.now() + data.expires_in * 1000,
        };

        return data.access_token;
    }

    /**
     * Create a PayPal order for a subscription tier purchase.
     */
    async createOrder(
        tierId: string,
        tierName: string,
        price: number,
        billingPeriod: 'monthly' | 'annual'
    ): Promise<{ orderId: string; approvalUrl: string }> {
        const accessToken = await this.getAccessToken();

        const orderPayload = {
            intent: 'CAPTURE',
            purchase_units: [
                {
                    reference_id: tierId,
                    description: `PMP Study Pro - ${tierName} (${billingPeriod})`,
                    amount: {
                        currency_code: 'USD',
                        value: price.toFixed(2),
                    },
                },
            ],
            application_context: {
                brand_name: 'PMP Study Pro',
                landing_page: 'LOGIN',
                user_action: 'PAY_NOW',
                return_url: `${env.CORS_ORIGIN[0]}/checkout/success`,
                cancel_url: `${env.CORS_ORIGIN[0]}/checkout/cancel`,
            },
        };

        const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`PayPal create order failed: ${response.status} ${errorText}`);
            throw new Error('Failed to create PayPal order');
        }

        const order = (await response.json()) as PayPalOrder;

        const approvalLink = order.links.find(link => link.rel === 'approve');
        if (!approvalLink) {
            throw new Error('PayPal order missing approval URL');
        }

        logger.info(`PayPal order created: ${order.id}`);

        return {
            orderId: order.id,
            approvalUrl: approvalLink.href,
        };
    }

    /**
     * Capture a PayPal order after user approval.
     * Returns the capture details if successful.
     */
    async captureOrder(orderId: string): Promise<PayPalCaptureResult> {
        const accessToken = await this.getAccessToken();

        const response = await fetch(
            `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            logger.error(`PayPal capture failed: ${response.status} ${errorText}`);
            throw new Error('Failed to capture PayPal order');
        }

        const captureResult = (await response.json()) as PayPalCaptureResult;

        logger.info(`PayPal order captured: ${captureResult.id}, status: ${captureResult.status}`);

        return captureResult;
    }

    /**
     * Verify a webhook signature from PayPal.
     * Returns true if the signature is valid.
     */
    async verifyWebhookSignature(
        webhookId: string,
        headers: {
            'paypal-auth-algo': string;
            'paypal-cert-url': string;
            'paypal-transmission-id': string;
            'paypal-transmission-sig': string;
            'paypal-transmission-time': string;
        },
        body: string
    ): Promise<boolean> {
        const accessToken = await this.getAccessToken();

        const verificationPayload = {
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: webhookId,
            webhook_event: JSON.parse(body),
        };

        const response = await fetch(
            `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verificationPayload),
            }
        );

        if (!response.ok) {
            logger.error(`PayPal webhook verification failed: ${response.status}`);
            return false;
        }

        const result = (await response.json()) as { verification_status: string };
        return result.verification_status === 'SUCCESS';
    }
}

export const paypalService = new PayPalService();
