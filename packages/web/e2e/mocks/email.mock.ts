/**
 * Email Service Mock Utilities
 *
 * Provides mock responses for email sending in tests
 */

export const MOCK_EMAIL_RESPONSES = {
  sendEmail: {
    success: {
      success: true,
      messageId: 'msg_test_1234567890',
    },
    error: {
      success: false,
      error: 'Failed to send email',
    },
  },

  verificationEmail: {
    to: 'test@example.com',
    subject: 'Verify your email',
    body: 'Click here to verify',
    verifyUrl: 'http://localhost:3005/auth/verify?token=test-token',
  },

  passwordResetEmail: {
    to: 'test@example.com',
    subject: 'Reset your password',
    body: 'Click here to reset',
    resetUrl: 'http://localhost:3005/auth/reset-password?token=reset-token',
  },

  orderConfirmationEmail: {
    to: 'test@example.com',
    subject: 'Order confirmation',
    body: 'Thank you for your order',
    orderId: 'order_test_1234567890',
  },
};

/**
 * Mock email sending API
 */
export function mockSendEmail(page: any, success: boolean = true) {
  return page.route('**/api/send-email', (route: any) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(
        success ? MOCK_EMAIL_RESPONSES.sendEmail.success : MOCK_EMAIL_RESPONSES.sendEmail.error
      ),
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

/**
 * Get last sent email (for testing)
 */
export async function getLastSentEmail(): Promise<any> {
  // In a real implementation, this would query a test email service
  // or use a service like Mailtrap
  return {
    to: 'test@example.com',
    subject: 'Test Email',
    body: 'Test body',
  };
}

/**
 * Extract verification link from email
 */
export async function getVerificationLink(email: string): Promise<string> {
  // Parse email and extract verification URL
  const match = email.match(/http[^\s]+verify[^\s]*/);
  return match ? match[0] : '';
}

/**
 * Extract password reset link from email
 */
export async function getPasswordResetLink(email: string): Promise<string> {
  const match = email.match(/http[^\s]+reset-password[^\s]*/);
  return match ? match[0] : '';
}
