# Privacy API Documentation

GDPR and CCPA compliance endpoints for the PMP Study Application.

## Table of Contents

- [Consent Management](#consent-management)
- [Data Export](#data-export)
- [Account Deletion](#account-deletion)
- [Admin Endpoints](#admin-endpoints)

---

## Consent Management

### Get User Consent

Retrieve the user's current consent status.

**Endpoint:** `GET /api/privacy/consent`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "consent": {
      "id": "consent-uuid",
      "userId": "user-uuid",
      "cookieConsent": true,
      "privacyPolicyAccepted": true,
      "termsAccepted": true,
      "consentVersion": "1.0",
      "consentIpAddress": "127.0.0.1",
      "consentUserAgent": "Mozilla/5.0...",
      "consentedAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "withdrawnAt": null,
      "withdrawnReason": null
    }
  }
}
```

---

### Update Consent

Update or create user consent records.

**Endpoint:** `PUT /api/privacy/consent`

**Authentication:** Required

**Rate Limit:** 5 requests per hour

**Request Body:**

```json
{
  "cookieConsent": true,
  "privacyPolicyAccepted": true,
  "termsAccepted": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "consent": {
      "id": "consent-uuid",
      "userId": "user-uuid",
      "cookieConsent": true,
      "privacyPolicyAccepted": true,
      "termsAccepted": true,
      "consentVersion": "1.0",
      "consentedAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "message": "Consent updated successfully"
}
```

---

### Withdraw Consent

Withdraw all previously given consent.

**Endpoint:** `POST /api/privacy/consent/withdraw`

**Authentication:** Required

**Rate Limit:** 5 requests per hour

**Request Body:**

```json
{
  "reason": "No longer want to be tracked"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Consent withdrawn successfully"
}
```

---

## Data Export

### Request Data Export

Request a comprehensive export of all user data (GDPR Right to Data Portability).

**Endpoint:** `POST /api/privacy/data-export`

**Authentication:** Required

**Rate Limit:** 1 request per 24 hours

**Request Body:**

```json
{
  "includePaymentHistory": true,
  "includeActivityLogs": true,
  "emailMe": false
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "exportRequest": {
      "id": "export-uuid",
      "userId": "user-uuid",
      "status": "pending",
      "requestId": "request-uuid",
      "requestedAt": "2024-01-01T00:00:00Z",
      "completedAt": null,
      "expiresAt": "2024-01-08T00:00:00Z",
      "downloadUrl": null,
      "fileSize": null
    }
  },
  "message": "Data export requested. You will receive an email when it is ready."
}
```

**Export Status Values:**

- `pending`: Request queued
- `processing`: Export being generated
- `completed`: Export ready for download
- `failed`: Export failed

---

### Get Export History

Get all data export requests for the current user.

**Endpoint:** `GET /api/privacy/data-export`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "exports": [
      {
        "id": "export-uuid",
        "userId": "user-uuid",
        "status": "completed",
        "requestId": "request-uuid",
        "requestedAt": "2024-01-01T00:00:00Z",
        "completedAt": "2024-01-01T00:05:00Z",
        "expiresAt": "2024-01-08T00:00:00Z",
        "downloadUrl": "/api/privacy/data-export/request-uuid/download",
        "fileSize": 12345
      }
    ]
  }
}
```

---

### Get Export Status

Get the status of a specific export request.

**Endpoint:** `GET /api/privacy/data-export/:requestId`

**Authentication:** Required

**Parameters:**

- `requestId`: Export request ID

**Response:**

```json
{
  "success": true,
  "data": {
    "exportRequest": {
      "id": "export-uuid",
      "userId": "user-uuid",
      "status": "completed",
      "requestId": "request-uuid",
      "requestedAt": "2024-01-01T00:00:00Z",
      "completedAt": "2024-01-01T00:05:00Z",
      "expiresAt": "2024-01-08T00:00:00Z",
      "downloadUrl": "/api/privacy/data-export/request-uuid/download",
      "fileSize": 12345
    }
  }
}
```

---

### Download Export

Download the completed data export file.

**Endpoint:** `GET /api/privacy/data-export/:requestId/download`

**Authentication:** Required

**Parameters:**

- `requestId`: Export request ID

**Response:**
JSON file with all user data (Content-Type: application/json)

**Export Data Structure:**

```json
{
  "profile": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "subscription": {
    "tier": "mid-level",
    "status": "active",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2025-01-01T00:00:00Z"
  },
  "paymentHistory": [
    {
      "id": "payment-uuid",
      "amount": 99.99,
      "currency": "USD",
      "status": "completed",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "studyProgress": {
    "completedSections": ["section-1", "section-2"],
    "lastChapter": "chapter-5",
    "lastSection": "section-10"
  },
  "flashcardReviews": 42,
  "questionAttempts": 150,
  "practiceSessions": [
    {
      "id": "session-uuid",
      "totalQuestions": 50,
      "correctAnswers": 35,
      "completedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "recentActivity": [
    {
      "type": "flashcard_session",
      "targetId": "session-uuid",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "teamMemberships": [
    {
      "teamName": "Company Team",
      "role": "member",
      "joinedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "exportGeneratedAt": "2024-01-01T00:00:00Z",
  "exportVersion": "1.0"
}
```

---

## Account Deletion

### Request Account Deletion

Request permanent deletion of account and all associated data (GDPR Right to be Forgotten).

**Endpoint:** `POST /api/privacy/delete-account`

**Authentication:** Required

**Rate Limit:** 5 requests per hour

**Request Body:**

```json
{
  "confirmPassword": "current-password",
  "reason": "No longer need the account"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "deletionRequest": {
      "id": "deletion-uuid",
      "userId": "user-uuid",
      "status": "pending",
      "requestedAt": "2024-01-01T00:00:00Z",
      "gracePeriodEnds": "2024-01-31T00:00:00Z",
      "completedAt": null,
      "cancelledAt": null,
      "deletionReason": "No longer need the account",
      "ipAddress": "127.0.0.1",
      "userAgent": "Mozilla/5.0...",
      "softDeletedAt": null,
      "hardDeleteScheduledFor": null,
      "processedBy": null
    }
  },
  "message": "Account deletion requested. Your account will be deleted after 30 days. You will receive a confirmation email."
}
```

**Deletion Process:**

1. **Request Period**: Account marked for deletion
2. **Grace Period (30 days)**: User can cancel the deletion
3. **Soft Delete**: Data anonymized (email, name randomized)
4. **Retention Period (7 years)**: Payment records kept for legal compliance
5. **Hard Delete**: Complete removal from database

---

### Get Deletion Status

Check if there's a pending account deletion request.

**Endpoint:** `GET /api/privacy/delete-account`

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "deletionRequest": {
      "id": "deletion-uuid",
      "userId": "user-uuid",
      "status": "pending",
      "requestedAt": "2024-01-01T00:00:00Z",
      "gracePeriodEnds": "2024-01-31T00:00:00Z",
      "deletionReason": "No longer need the account"
    }
  }
}
```

**Status Values:**

- `pending`: In grace period, can be cancelled
- `processing`: Grace period ended, being processed
- `completed`: Account has been deleted
- `cancelled`: User cancelled the deletion

---

### Cancel Account Deletion

Cancel a pending account deletion request (only during grace period).

**Endpoint:** `POST /api/privacy/delete-account/cancel`

**Authentication:** Required

**Request Body:**

```json
{
  "requestId": "deletion-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account deletion cancelled successfully"
}
```

**Note:** Cancellation is only allowed during the 30-day grace period.

---

## Admin Endpoints

All admin endpoints require admin privileges.

### Get Compliance Dashboard

Get overview of all privacy-related requests and statistics.

**Endpoint:** `GET /api/admin/privacy/dashboard`

**Authentication:** Required (Admin)

**Response:**

```json
{
  "success": true,
  "data": {
    "exportStats": {
      "totalRequests": 150,
      "pendingRequests": 5,
      "completedExports": 140,
      "failedExports": 5,
      "averageProcessingTime": 3
    },
    "deletionStats": {
      "totalRequests": 50,
      "pendingRequests": 3,
      "inGracePeriod": 2,
      "completedDeletions": 45,
      "cancelledDeletions": 2
    },
    "recentActivity": [
      {
        "id": "log-uuid",
        "actionType": "data_export",
        "entityType": "export_request",
        "entityId": "export-uuid",
        "userId": "user-uuid",
        "performedBy": "user-uuid",
        "status": "success",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pendingExports": [...],
    "pendingDeletions": [...]
  }
}
```

---

### Get All Export Requests

Get all data export requests with filtering.

**Endpoint:** `GET /api/admin/privacy/exports`

**Authentication:** Required (Admin)

**Query Parameters:**

- `status`: Filter by status (pending, processing, completed, failed)
- `userId`: Filter by user ID
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "exports": [...],
    "total": 150
  }
}
```

---

### Process Export (Admin)

Manually process a pending export request.

**Endpoint:** `POST /api/admin/privacy/exports/process`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "requestId": "export-uuid"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Export processed successfully"
}
```

---

### Get All Deletion Requests

Get all account deletion requests with filtering.

**Endpoint:** `GET /api/admin/privacy/deletions`

**Authentication:** Required (Admin)

**Query Parameters:**

- `status`: Filter by status (pending, processing, completed, cancelled)
- `userId`: Filter by user ID
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "deletions": [...],
    "total": 50
  }
}
```

---

### Process Deletion (Admin)

Manually process a deletion request, optionally bypassing grace period.

**Endpoint:** `POST /api/admin/privacy/deletions/process`

**Authentication:** Required (Admin)

**Request Body:**

```json
{
  "requestId": "deletion-uuid",
  "force": false
}
```

**Parameters:**

- `force`: Set to `true` to bypass grace period

**Response:**

```json
{
  "success": true,
  "message": "Deletion processed successfully"
}
```

---

### Get Audit Logs

Retrieve privacy audit logs with filtering.

**Endpoint:** `GET /api/admin/privacy/audit-logs`

**Authentication:** Required (Admin)

**Query Parameters:**

- `actionType`: Filter by action type
- `entityType`: Filter by entity type
- `userId`: Filter by user ID
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `limit`: Number of results (default: 50, max: 100)
- `offset`: Pagination offset (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-uuid",
        "actionType": "data_export",
        "entityType": "export_request",
        "entityId": "export-uuid",
        "userId": "user-uuid",
        "performedBy": "user-uuid",
        "ipAddress": "127.0.0.1",
        "userAgent": "Mozilla/5.0...",
        "requestId": "request-uuid",
        "status": "success",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 500
  }
}
```

---

### Get User Compliance Summary

Get privacy compliance summary for a specific user.

**Endpoint:** `GET /api/admin/privacy/users/:userId`

**Authentication:** Required (Admin)

**Response:**

```json
{
  "success": true,
  "data": {
    "consent": {
      "id": "consent-uuid",
      "userId": "user-uuid",
      "cookieConsent": true,
      "privacyPolicyAccepted": true,
      "termsAccepted": true
    },
    "exports": 3,
    "deletions": 0,
    "recentActivity": [...]
  }
}
```

---

### Process Pending Deletions (Cron)

Process all pending deletion requests whose grace period has ended.

**Endpoint:** `POST /api/admin/privacy/process-pending`

**Authentication:** Required (Admin)

**Response:**

```json
{
  "success": true,
  "data": {
    "processed": 5
  },
  "message": "Processed 5 pending deletions"
}
```

**Note:** This endpoint is typically called by a cron job.

---

## Error Codes

| Code           | Message                                                                     |
| -------------- | --------------------------------------------------------------------------- |
| `PRIVACY_001`  | Export request already exists. Please wait for current request to complete. |
| `PRIVACY_002`  | Export not found or has expired.                                            |
| `PRIVACY_003`  | Deletion request already exists.                                            |
| `PRIVACY_004`  | Invalid deletion request.                                                   |
| `PRIVACY_005`  | Grace period has expired. Cannot cancel deletion.                           |
| `PRIVACY_006`  | Admin access required.                                                      |
| `RATE_LIMITED` | Too many privacy requests, please try again later.                          |

---

## Rate Limiting

- **Consent updates**: 5 requests per hour
- **Data export requests**: 1 request per 24 hours
- **Account deletion requests**: 5 requests per hour

Rate limits are enforced per user and reset at the beginning of each window.

---

## Data Retention

| Data Type       | Retention Period      | Anonymization             |
| --------------- | --------------------- | ------------------------- |
| User Profile    | 30 days + 7 years     | Soft delete → Hard delete |
| Payment Records | 7 years               | Anonymized                |
| Study Progress  | 30 days               | Deleted                   |
| Activity Logs   | 30 days               | Deleted                   |
| Consent Records | Permanent (if active) | Withdrawn on request      |
| Audit Logs      | Permanent             | Never deleted             |
| Export Files    | 7 days                | Auto-deleted              |

---

## Security Considerations

1. **Authentication**: All privacy endpoints require valid JWT authentication
2. **Authorization**: Admin endpoints require admin privileges
3. **Password Verification**: Account deletion requires current password
4. **Audit Trail**: All privacy actions are logged with IP and user agent
5. **Rate Limiting**: Sensitive operations are rate-limited
6. **Encryption**: All data is encrypted at rest and in transit
7. **Data Minimization**: Only necessary data is collected and stored

---

## Compliance Features

### GDPR Compliance

- ✅ Right to Access (Data Export)
- ✅ Right to Rectification (Profile update)
- ✅ Right to Erasure (Account Deletion)
- ✅ Right to Data Portability (JSON Export)
- ✅ Right to Object (Consent Withdrawal)
- ✅ Right to Withdraw Consent
- ✅ Transparent Data Processing
- ✅ Audit Trail for All Actions

### CCPA Compliance

- ✅ Right to Know (Data Export)
- ✅ Right to Delete (Account Deletion)
- ✅ Right to Opt-Out (Consent Withdrawal)
- ✅ Right to Non-Discrimination
- ✅ Access to Specific Data Categories
- ✅ Data Disclosure Tracking

---

## Example Workflows

### Complete Account Deletion Flow

1. **User requests deletion**

   ```bash
   POST /api/privacy/delete-account
   {
     "confirmPassword": "password123",
     "reason": "Closing account"
   }
   ```

2. **User receives confirmation email** with:
   - Request ID
   - Grace period end date (30 days from now)
   - Cancellation link

3. **User can cancel during grace period**

   ```bash
   POST /api/privacy/delete-account/cancel
   {
     "requestId": "deletion-uuid"
   }
   ```

4. **After grace period**:
   - Account is soft deleted (data anonymized)
   - User cannot login
   - Email is randomized

5. **After 7 years**:
   - Hard delete (complete removal)
   - Payment records anonymized only

### Data Export Flow

1. **User requests export**

   ```bash
   POST /api/privacy/data-export
   {
     "includePaymentHistory": true,
     "includeActivityLogs": true
   }
   ```

2. **System processes in background**
   - Status: `pending` → `processing` → `completed`

3. **User checks status**

   ```bash
   GET /api/privacy/data-export/:requestId
   ```

4. **Download when ready**

   ```bash
   GET /api/privacy/data-export/:requestId/download
   ```

5. **Export expires after 7 days**

---

## Support

For privacy-related questions or concerns:

- Email: privacy@pmpstudy.com
- Documentation: /docs/privacy
- GDPR Policy: /legal/gdpr
- CCPA Policy: /legal/ccpa
