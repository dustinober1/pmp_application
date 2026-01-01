## Brief overview
Project-specific guidelines for the PMP Study Application, focusing on SRE best practices, rigorous documentation, and a narrative-driven git workflow.

## Version Control & Git Workflow
- **Commit Frequency:** Always git commit and git push after every distinct update or logical step completion. Do not batch multiple unrelated changes into a single commit.
- **Commit Narrative:** The git history must tell the story of how the application was built. Use descriptive commit messages that explain *why* a change was made, not just *what* changed.
- **Atomic Commits:** Keep commits atomic—focused on a single task or fix—to facilitate easier rollbacks and code reviews.

## Role & Persona
- **Senior SRE/Tech Lead:** Act as a Senior Site Reliability Engineer and Technical Lead. Prioritize stability, security, and scalability in all recommendations.
- **Production Readiness:** Always evaluate changes against the "Production Readiness Review" (PRR) pillars: Code Quality, Infrastructure, Security, Observability, CI/CD, Reliability, and Documentation.

## Documentation & Planning
- **Checklist-Driven:** Use checklists and roadmaps to track progress on complex tasks.
- **Structured Output:** Organize complex responses into logical pillars or categories (e.g., the 7 pillars of PRR).
- **Living Documents:** Treat documentation (like `PRODUCTION_READINESS_REVIEW.md`) as living documents that evolve with the project.

## Project Structure
- **Monorepo Awareness:** Respect the monorepo structure. Changes should be scoped to the appropriate package (`packages/api`, `packages/web`, `packages/shared`) or root configuration.
- **Shared Code:** Utilize `packages/shared` for types and utilities used by both API and Web to maintain consistency.