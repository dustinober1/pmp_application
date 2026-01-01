# System Architecture

## C4 Context Diagram
```mermaid
C4Context
  title System Context diagram for PMP Study Application

  Person(user, "PMP Student", "A user studying for the PMP exam.")
  System(pmp_app, "PMP Study App", "Allows users to take practice exams, review flashcards, and track progress.")
  System_Ext(paypal, "PayPal", "Handles payment processing.")
  System_Ext(email_system, "SMTP Server", "Sends transactional emails.")

  Rel(user, pmp_app, "Uses", "HTTPS")
  Rel(pmp_app, paypal, "Process Payments", "HTTPS/JSON")
  Rel(pmp_app, email_system, "Sends Emails", "SMTP")
```

## Container Diagram
```mermaid
C4Container
  title Container diagram for PMP Study Application

  Person(user, "PMP Student", "A user studying for the PMP exam.")

  System_Boundary(c1, "PMP Study Application") {
    Container(web_app, "Web Application", "Next.js (React)", "Delivers the static content and SPA.")
    Container(api_app, "API Application", "Node.js (Express)", "Provides functionality via JSON/HTTPS API.")
    ContainerDb(database, "Database", "PostgreSQL", "Stores user data, questions, and progress.")
    ContainerDb(cache, "Cache", "Redis", "Stores session data and cached content.")
  }

  Rel(user, web_app, "Visits", "HTTPS")
  Rel(web_app, api_app, "Makes API calls to", "JSON/HTTPS")
  Rel(api_app, database, "Reads from and writes to", "SQL/TCP")
  Rel(api_app, cache, "Reads from and writes to", "RESP/TCP")
```

## Infrastructure Diagram (AWS)
- **VPC:** 10.0.0.0/16
  - **Public Subnets:** Load Balancers, NAT Gateways.
  - **Private Subnets:** EKS Nodes, RDS, Redis.
- **Compute:** EKS Cluster (Auto-scaling Node Group).
- **Data:** RDS (PostgreSQL Multi-AZ), ElastiCache (Redis).
- **Security:** Security Groups restricting access to internal components.