# Disaster Recovery Plan (DRP)

## Overview
This document outlines the procedures for recovering the PMP Study Application in the event of a major disaster affecting the production environment in `us-east-1`.

## Recovery Objectives
- **Recovery Time Objective (RTO):** 4 Hours
- **Recovery Point Objective (RPO):** 24 Hours (Daily Backups)

## Backup Strategy
- **Database (RDS):** Automated daily snapshots with 30-day retention.
- **Cache (Redis):** No persistence required; cache can be rebuilt.
- **Infrastructure:** All infrastructure defined in Terraform (`infrastructure/terraform/`).
- **Code:** All code versioned in GitHub.

## Disaster Scenarios & Recovery Procedures

### Scenario 1: Database Corruption or Accidental Deletion
**Severity:** Critical
**Response:**
1.  **Identify the Incident:** Confirm database unavailability via monitoring alerts.
2.  **Stop Application:** Scale down API pods to 0 to prevent erratic behavior.
    ```bash
    kubectl scale deployment pmp-api --replicas=0 -n pmp
    ```
3.  **Restore RDS:**
    - Go to AWS Console > RDS > Snapshots.
    - Select the latest valid snapshot.
    - Click "Restore Snapshot".
    - **Important:** Ensure the new instance identifier matches the production configuration or update secrets accordingly.
4.  **Verify Data:** Connect to the new DB instance and verify integrity.
5.  **Restart Application:** Scale API pods back up.
    ```bash
    kubectl scale deployment pmp-api --replicas=2 -n pmp
    ```

### Scenario 2: Region Failure (us-east-1 unavailable)
**Severity:** Catastrophic
**Response:**
1.  **Declare Disaster:** CTO/VP Engineering declares disaster.
2.  **Provision in Secondary Region (e.g., us-west-2):**
    - Update Terraform `provider` region to `us-west-2`.
    - Run `terraform apply`.
3.  **Restore Data:**
    - **Note:** Cross-region read replicas (if configured) would speed this up. Otherwise, restore from Cross-Region Backup Copies.
4.  **Update DNS:**
    - Update Route53 (or DNS provider) to point to the new Load Balancer in `us-west-2`.
5.  **Verify System:** Perform E2E tests on the new environment.

## Testing Schedule
- **Backup Verification:** Monthly check of backup integrity.
- **Game Day:** Bi-annual simulation of Scenario 1 (in a staging environment).

## Contacts
- **Incident Commander:** [Name/Phone]
- **Database Lead:** [Name/Phone]
- **Infrastructure Lead:** [Name/Phone]