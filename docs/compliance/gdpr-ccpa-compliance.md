# GDPR & CCPA Compliance Documentation

## Overview

This document outlines how the PMP Study Application complies with the **EU General Data Protection Regulation (GDPR)** and the **California Consumer Privacy Act (CCPA)**.

**Last Updated:** January 1, 2026
**Compliance Version:** 1.0

---

## Table of Contents

1. [Scope](#scope)
2. [Data Collected](#data-collected)
3. [Legal Basis for Processing](#legal-basis-for-processing)
4. [User Rights](#user-rights)
5. [Data Security](#data-security)
6. [Data Retention](#data-retention)
7. [Third-Party Services](#third-party-services)
8. [International Data Transfers](#international-data-transfers)
9. [Children's Privacy](#childrens-privacy)
10. [Compliance Features](#compliance-features)
11. [Incident Response](#incident-response)
12. [Contact Information](#contact-information)

---

## Scope

This compliance program applies to:

- **Application:** PMP Study Application
- **Platform:** Web application (https://pmpstudy.com)
- **Users:** All individuals who create an account or use the service
- **Regions Covered:**
  - European Union (GDPR)
  - California, USA (CCPA)
  - All other jurisdictions

---

## Data Collected

### Personal Data

| Data Category | Purpose | Legal Basis | Retention |
|---------------|---------|-------------|-----------|
| **Name** | User identification | Contract performance | Account lifetime + 7 years |
| **Email** | Authentication, communications | Contract performance, consent | Account lifetime + 7 years |
| **Password** | Authentication | Contract performance | Hashed, account lifetime |
| **Payment Information** | Billing, subscription | Contract performance | 7 years (tax compliance) |
| **Study Progress** | Service delivery | Contract performance | Account lifetime |
| **Activity Logs** | Service improvement | Legitimate interest | 30 days |
| **IP Address** | Security, analytics | Legitimate interest | 30 days |
| **User Agent** | Service optimization | Legitimate interest | 30 days |

### Sensitive Data

**NOT COLLECTED:**
- No biometric data
- No health information
- No racial or ethnic origin
- No political opinions
- No religious beliefs
- No trade union membership

---

## Legal Basis for Processing

### GDPR Legal Bases (Article 6)

1. **Contract Performance** (Article 6(1)(b))
   - User registration and account management
   - Subscription service delivery
   - Study progress tracking

2. **Consent** (Article 6(1)(a))
   - Cookie consent
   - Marketing communications
   - Analytics tracking

3. **Legitimate Interest** (Article 6(1)(f))
   - Fraud prevention
   - Security monitoring
   - Service improvement
   - Analytics (with opt-out)

4. **Legal Obligation** (Article 6(1)(c))
   - Tax record retention
   - Payment processing records

### CCPA Categories

- **Category A:** Identifiers (name, email)
- **Category B:** Personal information categories in CCPA
- **Category D:** Commercial information (payment history)
- **Category F:** Internet or electronic activity

---

## User Rights

### GDPR Rights (Articles 15-20)

#### 1. Right to Access (Article 15)

**Implementation:**
- Endpoint: `GET /api/privacy/data-export/:requestId/download`
- Response Time: Within 30 days
- Format: Machine-readable JSON
- Scope: All personal data

**Example:**
```bash
GET /api/privacy/data-export
POST /api/privacy/data-export
GET /api/privacy/data-export/:requestId/download
```

#### 2. Right to Rectification (Article 16)

**Implementation:**
- Endpoint: `PUT /api/auth/profile`
- Response Time: Within 30 days
- Scope: Inaccurate or incomplete personal data

#### 3. Right to Erasure (Article 17)

**Also known as:** "Right to be Forgotten"

**Implementation:**
- Endpoint: `POST /api/privacy/delete-account`
- Grace Period: 30 days (cancellable)
- Soft Delete: Anonymize data
- Hard Delete: After 7 years (legal retention)
- Scope: All personal data

**Exceptions:**
- Legal obligation (tax records)
- Contract performance (active subscription)
- Legitimate interest (fraud prevention)

#### 4. Right to Restrict Processing (Article 18)

**Implementation:**
- Consent withdrawal via `POST /api/privacy/consent/withdraw`
- Stops non-essential processing
- Essential services remain active

#### 5. Right to Data Portability (Article 20)

**Implementation:**
- Endpoint: `GET /api/privacy/data-export/:requestId/download`
- Format: Structured, machine-readable JSON
- Scope: All data provided by user

**Data Included:**
- Profile information
- Subscription history
- Payment history (anonymized)
- Study progress
- Activity logs
- Certificates

#### 6. Right to Object (Article 21)

**Implementation:**
- Consent withdrawal: `POST /api/privacy/consent/withdraw`
- Marketing opt-out
- Analytics opt-out

#### 7. Rights Regarding Automated Decision-Making (Article 22)

**Status:** Not applicable - no automated decision-making

### CCPA Rights (1798.100-1798.130)

#### 1. Right to Know (1798.100, 1798.115)

**Implementation:**
- Endpoint: `GET /api/privacy/data-export`
- Disclosure at collection: Privacy Policy
- Response Time: Within 45 days

#### 2. Right to Delete (1798.105)

**Implementation:**
- Endpoint: `POST /api/privacy/delete-account`
- Response Time: Within 45 days
- Verification required: Password confirmation

#### 3. Right to Opt-Out (1798.120)

**Implementation:**
- Endpoint: `POST /api/privacy/consent/withdraw`
- "Do Not Sell My Info" link in footer
- Cookie consent banner

#### 4. Right to Non-Discrimination (1798.125)

**Guarantees:**
- No denial of service for exercising rights
- No price discrimination
- No quality of service reduction

---

## Data Security

### Technical Measures

1. **Encryption at Rest**
   - Database: PostgreSQL with AES-256 encryption
   - File Storage: Encrypted cloud storage
   - Passwords: bcrypt with salt (12 rounds)

2. **Encryption in Transit**
   - TLS 1.3 for all communications
   - HTTPS enforced
   - HSTS headers

3. **Access Controls**
   - JWT-based authentication
   - Role-based access control (RBAC)
   - Admin privilege separation
   - Audit logging

4. **Data Minimization**
   - Only collect necessary data
   - Automatic data deletion after retention period
   - Anonymization for long-term storage

### Organizational Measures

1. **Employee Training**
   - GDPR/CCPA compliance training
   - Security awareness training
   - Annual certification

2. **Access Policies**
   - Need-to-know access
   - Background checks for personnel
   - Confidentiality agreements

3. **Incident Response**
   - Breach detection within 24 hours
   - GDPR notification within 72 hours
   - CCPA notification without delay
   - Detailed incident logs

---

## Data Retention

### Retention Schedule

| Data Type | Active Use | Soft Delete | Hard Delete | Legal Basis |
|-----------|------------|-------------|-------------|-------------|
| **User Profile** | Account lifetime | N/A | 7 years after deletion | Tax compliance |
| **Email** | Account lifetime | Immediate | 7 years | Tax compliance |
| **Password Hash** | Account lifetime | Immediate | Immediate | Security |
| **Payment Records** | 7 years | Never | 7 years | Tax law |
| **Study Progress** | Account lifetime | 30 days | 7 years | Service quality |
| **Activity Logs** | 30 days | N/A | 30 days | Service improvement |
| **Consent Records** | Indefinite | Indefinite | 7 years | Compliance |
| **Audit Logs** | Indefinite | Never | Never | Compliance |
| **Export Files** | 7 days | N/A | 7 days | User request |

### Automatic Deletion

1. **Expired Exports:** 7 days
2. **Activity Logs:** 30 days
3. **Expired Sessions:** 7 days
4. **Soft-Deleted Accounts:** 7 years
5. **Cancelled Deletion Requests:** Immediate

---

## Third-Party Services

### Data Processors (GDPR Article 28)

| Service | Purpose | Data Shared | Safeguards | Location |
|---------|---------|-------------|------------|----------|
| **Stripe** | Payment processing | Email, payment info | PCI DSS compliant | USA |
| **PostgreSQL** | Database hosting | All user data | SOC 2 compliant | Configurable |
| **Cloud Provider** | Hosting | All application data | ISO 27001 | Configurable |
| **Email Service** | Transactional emails | Email, name | GDPR compliant | EU/USA |

### Data Processing Agreements (DPAs)

- Signed with all processors
- Include Standard Contractual Clauses (SCCs)
- Specify data processing instructions
- Require confidentiality and security

### Cookie Consent

**Categories:**
1. **Essential** (Required)
   - Authentication
   - Security
   - Session management

2. **Functional** (Opt-in)
   - User preferences
   - Study progress

3. **Analytics** (Opt-in)
   - Anonymous usage statistics
   - Performance monitoring

4. **Marketing** (Opt-in)
   - Newsletter subscriptions
   - Promotional emails

**Implementation:**
- Cookie consent banner on first visit
- Granular consent options
- Consent management via `PUT /api/privacy/consent`
- Withdrawal via `POST /api/privacy/consent/withdraw`

---

## International Data Transfers

### GDPR Compliance

**Mechanisms:**
1. **Standard Contractual Clauses (SCCs)** for non-EEA transfers
2. **Adequacy Decisions** for approved countries
3. **Data localization** (optional)

**Current Transfers:**
- **Stripe Payments:** USA (SCCs + Privacy Shield framework)
- **Cloud Hosting:** Configurable (EU/US/Asia)

**Safeguards:**
- SCCs adopted (European Commission Decision 2021/914)
- Technical security measures
- Organizational controls
- Regular compliance audits

### CCPA Compliance

**No international transfer restrictions** under CCPA.

---

## Children's Privacy

### COPPA Compliance

**Policy:** This service is not intended for children under 13.

**Age Verification:**
- No age verification performed
- Terms of Service state age requirement
- Parents/guardians must supervise minors

**Data Collection from Minors (13-18):**
- Requires parental consent
- Limited data collection
- No marketing to minors

---

## Compliance Features

### Implemented Features

#### 1. Consent Management

**API Endpoints:**
```typescript
GET    /api/privacy/consent              // Get consent status
PUT    /api/privacy/consent              // Update consent
POST   /api/privacy/consent/withdraw     // Withdraw consent
```

**Database Schema:**
```prisma
model PrivacyConsent {
  cookieConsent: Boolean
  privacyPolicyAccepted: Boolean
  termsAccepted: Boolean
  consentVersion: String
  consentedAt: DateTime
  withdrawnAt: DateTime?
}
```

#### 2. Data Export (Right to Data Portability)

**API Endpoints:**
```typescript
POST   /api/privacy/data-export                    // Request export
GET    /api/privacy/data-export                    // Get history
GET    /api/privacy/data-export/:requestId         // Get status
GET    /api/privacy/data-export/:requestId/download // Download
```

**Export Format:**
```json
{
  "profile": {...},
  "subscription": {...},
  "paymentHistory": [...],
  "studyProgress": {...},
  "practiceSessions": [...],
  "recentActivity": [...],
  "exportGeneratedAt": "2024-01-01T00:00:00Z",
  "exportVersion": "1.0"
}
```

**Rate Limiting:** 1 request per 24 hours

#### 3. Account Deletion (Right to be Forgotten)

**API Endpoints:**
```typescript
POST   /api/privacy/delete-account           // Request deletion
GET    /api/privacy/delete-account           // Get status
POST   /api/privacy/delete-account/cancel    // Cancel deletion
```

**Deletion Timeline:**
1. **Request:** User confirms password
2. **Grace Period:** 30 days (cancellable)
3. **Soft Delete:** Anonymize immediately
4. **Hard Delete:** After 7 years (legal retention)

#### 4. Audit Logging

**All Actions Logged:**
- Data export requests
- Account deletion requests
- Consent given/withdrawn
- Data accessed
- Account soft/hard deleted

**Log Storage:** Indefinite (compliance requirement)

**API Endpoint:**
```typescript
GET    /api/admin/privacy/audit-logs    // Requires admin
```

#### 5. Admin Dashboard

**Features:**
- Compliance statistics
- Pending requests
- Request processing
- Audit log viewing
- User compliance summaries

**API Endpoints:**
```typescript
GET    /api/admin/privacy/dashboard           // Overview
GET    /api/admin/privacy/exports             // Export requests
POST   /api/admin/privacy/exports/process     // Process export
GET    /api/admin/privacy/deletions           // Deletion requests
POST   /api/admin/privacy/deletions/process   // Process deletion
GET    /api/admin/privacy/audit-logs          // Audit logs
GET    /api/admin/privacy/users/:userId       // User summary
POST   /api/admin/privacy/process-pending     // Cron endpoint
```

---

## Incident Response

### Data Breach Procedure

#### 1. Detection

**Automated Monitoring:**
- Security Information and Event Management (SIEM)
- Intrusion Detection System (IDS)
- Anomaly detection
- Audit log monitoring

#### 2. Assessment

**Within 24 hours:**
- Determine scope of breach
- Identify affected data
- Assess risk to individuals
- Classify severity level

#### 3. Notification

**GDPR Requirements (Article 33):**
- **Supervisory Authority:** Within 72 hours
- **Data Subjects:** Without undue delay if high risk
- **Content:** Nature of breach, categories affected, consequences, mitigation measures

**CCPA Requirements (1798.82):**
- **Affected Individuals:** Without delay
- **Attorney General:** If breach affects 500+ CA residents

**Notification Channels:**
- Email to affected individuals
- Website notice
- Press release (if large scale)

#### 4. Mitigation

**Immediate Actions:**
- Secure breach point
- Reset compromised credentials
- Enable additional monitoring
- Engage forensic experts

**Post-Incident:**
- Root cause analysis
- Process improvement
- Employee retraining
- Documentation updates

### Breach Response Team

**Roles:**
1. **Incident Commander** - Lead response
2. **Legal Counsel** - GDPR/CCPA compliance
3. **Security Engineer** - Technical mitigation
4. **Customer Support** - User communication
5. **PR/Communications** - Public statements

---

## Contact Information

### Data Protection Officer (DPO)

**Email:** dpo@pmpstudy.com
**Address:** [Company Address]

### GDPR Representative

**For EU Users:**
- Email: eu-rep@pmpstudy.com
- Address: [EU Representative Address]

### CCPA Contact

**For California Residents:**
- Email: privacy@pmpstudy.com
- Phone: [Phone Number]
- Address: [Company Address]
- Toll-free: [If available]

### General Inquiries

**Email:** privacy@pmpstudy.com
**Website:** https://pmpstudy.com/privacy
**Documentation:** https://pmpstudy.com/docs/privacy

### Response Times

- **Data Access Requests:** 30 days (GDPR) / 45 days (CCPA)
- **Deletion Requests:** 30 days (GDPR) / 45 days (CCPA)
- **Correction Requests:** 30 days
- **General Inquiries:** 14 days
- **Emergency Requests:** 24-48 hours

---

## Compliance Certifications

### Current Status

- ✅ GDPR Compliant (Version 1.0)
- ✅ CCPA Compliant (Version 1.0)
- ✅ Privacy Policy Updated
- ✅ Cookie Consent Implemented
- ✅ Data Export Functional
- ✅ Account Deletion Functional
- ✅ Audit Logging Active
- ✅ Incident Response Plan

### Future Enhancements

- [ ] ISO 27001 Certification
- [ ] SOC 2 Type II Report
- [ ] Privacy Shield Framework (if applicable)
- [ ] APEC CBPR Certification
- [ ] Binding Corporate Rules (BCRs)

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-01-01 | Initial GDPR/CCPA compliance documentation | Compliance Team |

---

## Related Documents

1. **Privacy Policy:** /legal/privacy
2. **Terms of Service:** /legal/terms
3. **Cookie Policy:** /legal/cookies
4. **Data Processing Agreement:** /legal/dpa
5. **Security Policy:** /legal/security
6. **API Documentation:** /docs/api/privacy-api

---

## References

### GDPR

- [Official EU GDPR Text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32016R0679)
- [UK GDPR](https://www.legislation.gov.uk/ukpga/2018/12/contents/enacted)
- [EDPB Guidelines](https://edpb.europa.eu/)

### CCPA

- [California Civil Code 1798.100-1798.130](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawNum=CIV.&sectionNum=1798.100)
- [CCPA Regulations](https://oag.ca.gov/privacy/ccpa)
- [California AG CCPA Page](https://oag.ca.gov/privacy/ccpa)

### Security Standards

- [ISO 27001](https://www.iso.org/standard/27001)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**This document is reviewed annually and updated as required by law and regulatory changes.**
