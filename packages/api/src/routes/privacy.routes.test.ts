import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import express from 'express';
import privacyRoutes from './privacy.routes';
import { consentService, dataExportService, accountDeletionService } from '../services';

// Mock services
vi.mock('../services', () => ({
  consentService: {
    getUserConsent: vi.fn(),
    updateConsent: vi.fn(),
    withdrawConsent: vi.fn(),
  },
  dataExportService: {
    requestExport: vi.fn(),
    getExportHistory: vi.fn(),
    getExportStatus: vi.fn(),
    downloadExport: vi.fn(),
  },
  accountDeletionService: {
    requestDeletion: vi.fn(),
    getDeletionStatus: vi.fn(),
    cancelDeletion: vi.fn(),
  },
}));

vi.mock('../middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123', email: 'test@example.com' };
    next();
  },
}));

describe('Privacy Routes', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/privacy', privacyRoutes);
    vi.clearAllMocks();
  });

  describe('GET /api/privacy/consent', () => {
    it('should get user consent', async () => {
      const mockConsent = {
        id: 'consent-123',
        userId: 'user-123',
        cookieConsent: true,
        privacyPolicyAccepted: true,
        termsAccepted: true,
        consentVersion: '1.0',
        consentedAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(consentService.getUserConsent).mockResolvedValue(mockConsent);

      const response = await request(app).get('/api/privacy/consent');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.consent).toEqual(mockConsent);
    });
  });

  describe('PUT /api/privacy/consent', () => {
    it('should update user consent', async () => {
      const consentUpdate = {
        cookieConsent: true,
        privacyPolicyAccepted: true,
        termsAccepted: true,
      };

      const mockConsent = {
        id: 'consent-123',
        userId: 'user-123',
        ...consentUpdate,
        consentVersion: '1.0',
        consentedAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(consentService.updateConsent).mockResolvedValue(mockConsent);

      const response = await request(app).put('/api/privacy/consent').send(consentUpdate);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(consentService.updateConsent).toHaveBeenCalledWith(
        'user-123',
        consentUpdate,
        expect.any(Object)
      );
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .put('/api/privacy/consent')
        .send({ cookieConsent: 'not-a-boolean' });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/privacy/consent/withdraw', () => {
    it('should withdraw consent', async () => {
      vi.mocked(consentService.withdrawConsent).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/privacy/consent/withdraw')
        .send({ reason: 'No longer want tracking' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(consentService.withdrawConsent).toHaveBeenCalledWith(
        'user-123',
        'No longer want tracking',
        expect.any(Object)
      );
    });
  });

  describe('POST /api/privacy/data-export', () => {
    it('should request data export', async () => {
      const mockExport = {
        id: 'export-123',
        userId: 'user-123',
        status: 'pending',
        requestId: 'request-123',
        requestedAt: new Date(),
        expiresAt: new Date(),
      };

      vi.mocked(dataExportService.requestExport).mockResolvedValue(mockExport);

      const response = await request(app)
        .post('/api/privacy/data-export')
        .send({ includePaymentHistory: true, emailMe: false });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(dataExportService.requestExport).toHaveBeenCalledWith(
        'user-123',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should use default values', async () => {
      const mockExport = {
        id: 'export-123',
        userId: 'user-123',
        status: 'pending',
        requestId: 'request-123',
        requestedAt: new Date(),
        expiresAt: new Date(),
      };

      vi.mocked(dataExportService.requestExport).mockResolvedValue(mockExport);

      const response = await request(app).post('/api/privacy/data-export').send({});

      expect(response.status).toBe(201);
      expect(dataExportService.requestExport).toHaveBeenCalledWith(
        'user-123',
        {
          includePaymentHistory: true,
          includeActivityLogs: true,
          emailMe: false,
        },
        expect.any(Object)
      );
    });
  });

  describe('GET /api/privacy/data-export', () => {
    it('should get export history', async () => {
      const mockHistory = [
        {
          id: 'export-123',
          userId: 'user-123',
          status: 'completed',
          requestId: 'request-123',
          requestedAt: new Date(),
          expiresAt: new Date(),
        },
      ];

      vi.mocked(dataExportService.getExportHistory).mockResolvedValue(mockHistory);

      const response = await request(app).get('/api/privacy/data-export');

      expect(response.status).toBe(200);
      expect(response.body.data.exports).toEqual(mockHistory);
    });
  });

  describe('GET /api/privacy/data-export/:requestId', () => {
    it('should get export status', async () => {
      const mockExport = {
        id: 'export-123',
        userId: 'user-123',
        status: 'processing',
        requestId: 'request-123',
        requestedAt: new Date(),
        expiresAt: new Date(),
      };

      vi.mocked(dataExportService.getExportStatus).mockResolvedValue(mockExport);

      const response = await request(app).get('/api/privacy/data-export/request-123');

      expect(response.status).toBe(200);
      expect(response.body.data.exportRequest).toEqual(mockExport);
    });
  });

  describe('GET /api/privacy/data-export/:requestId/download', () => {
    it('should download export data', async () => {
      const mockData = {
        profile: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        exportGeneratedAt: new Date(),
        exportVersion: '1.0',
      };

      vi.mocked(dataExportService.downloadExport).mockResolvedValue(mockData);

      const response = await request(app).get('/api/privacy/data-export/request-123/download');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/json');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toEqual(mockData);
    });
  });

  describe('POST /api/privacy/delete-account', () => {
    it('should request account deletion', async () => {
      const mockDeletion = {
        id: 'deletion-123',
        userId: 'user-123',
        status: 'pending',
        requestedAt: new Date(),
        gracePeriodEnds: new Date(),
        deletionReason: 'Closing account',
      };

      vi.mocked(accountDeletionService.requestDeletion).mockResolvedValue(mockDeletion);

      const response = await request(app).post('/api/privacy/delete-account').send({
        confirmPassword: 'password123',
        reason: 'Closing account',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.deletionRequest).toEqual(mockDeletion);
      expect(accountDeletionService.requestDeletion).toHaveBeenCalledWith(
        'user-123',
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should validate password confirmation is present', async () => {
      const response = await request(app)
        .post('/api/privacy/delete-account')
        .send({ reason: 'Closing account' });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/privacy/delete-account', () => {
    it('should get deletion status', async () => {
      const mockDeletion = {
        id: 'deletion-123',
        userId: 'user-123',
        status: 'pending',
        requestedAt: new Date(),
        gracePeriodEnds: new Date(),
      };

      vi.mocked(accountDeletionService.getDeletionStatus).mockResolvedValue(mockDeletion);

      const response = await request(app).get('/api/privacy/delete-account');

      expect(response.status).toBe(200);
      expect(response.body.data.deletionRequest).toEqual(mockDeletion);
    });

    it('should return null when no deletion exists', async () => {
      vi.mocked(accountDeletionService.getDeletionStatus).mockResolvedValue(null);

      const response = await request(app).get('/api/privacy/delete-account');

      expect(response.status).toBe(200);
      expect(response.body.data.deletionRequest).toBeNull();
    });
  });

  describe('POST /api/privacy/delete-account/cancel', () => {
    it('should cancel deletion request', async () => {
      vi.mocked(accountDeletionService.cancelDeletion).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/privacy/delete-account/cancel')
        .send({ requestId: 'deletion-123' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(accountDeletionService.cancelDeletion).toHaveBeenCalledWith(
        'user-123',
        'deletion-123',
        expect.any(Object)
      );
    });

    it('should validate requestId format', async () => {
      const response = await request(app)
        .post('/api/privacy/delete-account/cancel')
        .send({ requestId: 'not-a-uuid' });

      expect(response.status).toBe(400);
    });
  });
});
