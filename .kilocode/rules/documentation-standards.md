## Brief overview

Guidelines for documentation organization and structure within the project. All non-standard documentation must be centralized.

## Documentation Location

- **Centralized Docs:** All documentation files (except for `README.md` and `CONTRIBUTING.md` which may live at the root for GitHub visibility) should be placed in the `docs/` folder.
- **Non-Standard Docs:** Any additional documentation such as runbooks (`RUNBOOK.md`), architecture diagrams (`ARCHITECTURE.md`), disaster recovery plans (`DISASTER_RECOVERY_PLAN.md`), and PRR checklists (`PRODUCTION_READINESS_REVIEW.md`) must be located within `docs/`.
- **Root Exceptions:** Only keep essential files like `README.md` and `LICENSE` in the root directory if absolutely necessary for repository presentation; move deeper technical documentation to `docs/`.
