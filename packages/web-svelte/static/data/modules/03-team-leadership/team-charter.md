# 3.1c Team Charters, Working Agreements & Social Contracts

**ECO Task**: Define team ground rules
**ECO Task**: Build shared understanding

High-performing teams don't assume how they will work; they define it. The **Team Charter** is the "North Star" for team behavior, collaboration, and collective accountability.

---

## 📜 The Team Charter
A living document created **by the team, for the team**. It sets the guardrails for a high-trust culture.

*   **Team Values**: What do we stand for? (e.g., Integrity, Radical Transparency, Respect).
*   **Ground Rules**: Behavioral "laws" (e.g., "Always have cameras on," "No phones during standups").
*   **Communication**: Tools and norms: Slack for quick syncs, Email for formal updates, Jira for tasks.
*   **Decision Making**: How do we decide? (e.g., Majority vote, Consensus, or PM as tie-breaker).

---

## 🧾 Comprehensive Team Charter Template
Your charter should be short, clear, and reviewed regularly. Use this checklist as a starting point:

### Section 1: Purpose & Context
*   **Team mission**: A one-sentence statement of why this team exists
*   **Success criteria**: What does "done" look like for the project?
*   **Key constraints**: Budget, timeline, compliance, dependencies
*   **Stakeholders**: Who do we serve? Who do we report to?

### Section 2: Team Composition & Roles
*   **Team roster**: Names, roles, contact info, time zones
*   **RACI for major deliverables**: Link to or embed the responsibility matrix
*   **Escalation contacts**: Sponsor, functional managers, key SMEs

### Section 3: Communication Norms
| Channel       | Usage                           | Response Expectation         |
| :------------ | :------------------------------ | :--------------------------- |
| **Slack/Teams** | Quick questions, blockers       | 2-4 hours during work hours  |
| **Email**     | Formal updates, external comms  | 24 hours                     |
| **Video Call** | Complex discussions, sensitive topics | Scheduled                    |
| **Task Board** | Status updates, assignments     | Real-time                    |
| **Decision Log** | Recording key decisions         | After each decision          |

### Section 4: Meeting Norms
| Meeting         | Frequency | Duration | Facilitator   | Rules                                |
| :-------------- | :-------- | :------- | :------------ | :----------------------------------- |
| Daily Standup   | Daily     | 15 min   | Rotating      | Yesterday/Today/Blockers only        |
| Sprint Planning | Bi-weekly | 2 hours  | Scrum Master  | Prepared backlog required            |
| Retrospective   | Bi-weekly | 1 hour   | Rotating      | What worked/What didn't/Actions      |
| Stakeholder Review | Weekly    | 30 min   | PM            | Demo ready work only                 |

**Meeting Best Practices:**
*   No meeting without an agenda shared 24h in advance
*   Start on time, even if people are missing
*   Capture decisions and actions in writing
*   End with clarity on next steps

### Section 5: Decision Making
*   **Default method**: How do we decide when there's no explicit rule?
*   **Tie-breaker**: Who decides when the team is deadlocked?
*   **Decision log**: Where do we record decisions?
*   **Change process**: How do we revisit past decisions?

### Section 6: Quality Standards
*   **Definition of Done (DoD)**: Checklist for ALL work items
*   **Acceptance Criteria (AC)**: Specific requirements for individual items
*   **Review process**: Who reviews? How long does it take?
*   **Testing expectations**: What must be tested before "done"?

### Section 7: Conflict & Escalation Path
*   **Step 1**: Direct conversation between parties
*   **Step 2**: Facilitated session with PM/Scrum Master
*   **Step 3**: Involve functional managers if needed
*   **Step 4**: Escalate to sponsor (last resort)

---

## 🚦 Ground Rules: The Behavioral Contract
Ground rules are only effective if they follow these three principles:
1.  **Collaborative**: The team must write them to "own" them
2.  **Visible**: Displayed prominently in the physical or digital project space
3.  **Self-Policing**: High-performing teams call out rule violations themselves, without needing the PM to play "police officer"

### Sample Ground Rules
**Meeting Conduct:**
*   Be present (cameras on for video calls)
*   One conversation at a time
*   Start and end on time
*   Mute when not speaking

**Communication:**
*   Assume positive intent
*   Raise blockers within 24 hours
*   No email chains for urgent issues—use chat or call
*   Document decisions in the decision log

**Work Habits:**
*   Update the board daily
*   Flag risks as soon as identified
*   Ask for help before struggling in silence
*   Review PRs within 24 hours

---

## 📝 Definition of Done (DoD) vs. Acceptance Criteria (AC)
These are critical "agreements" that often confuse students and cause rework in real projects.

| Aspect     | Definition of Done (DoD)                     | Acceptance Criteria (AC)                   |
| :--------- | :------------------------------------------- | :----------------------------------------- |
| **Scope**  | Applies to **ALL** items                     | Applies to **ONE** specific item           |
| **Created by** | Team (once)                                  | Product Owner (per story)                  |
| **Example** | "Code reviewed, tests passed, docs updated"  | "Login button is blue, page loads in <2s" |
| **Purpose** | Quality gate for everything                  | Specific requirements for one story        |
| **When used** | Before marking anything "done"               | During story acceptance                    |

### Sample Definition of Done Checklist
*   Code peer-reviewed and approved
*   Unit tests written and passing
*   Integration tests passing
*   No critical/high bugs open
*   Documentation updated
*   Security scan completed
*   Performance baseline met
*   Deployed to staging environment
*   Product Owner sign-off (if applicable)

::: info 🛠️ 2026 Focus: Adaptive Agreements
In an Agile or Hybrid context, the Team Charter is not static. It is reviewed during every **Retrospective**. If a rule (e.g., "Meetings at 9:00 AM") is causing friction (e.g., child-care commutes), the team changes it immediately to optimize flow.
:::

---

## 🗳️ Decision Models: When to Use Which
Decision rules prevent "hidden rework" caused by repeating the same debate.

| Model                 | Best When                                   | How It Works                                  | Risk                                    |
| :-------------------- | :------------------------------------------ | :-------------------------------------------- | :-------------------------------------- |
| **Consensus**         | High-impact decisions that require buy-in   | Everyone agrees (or at least consents)        | Slow if not time-boxed; may water down bold ideas |
| **Majority Vote**     | Time-boxed decisions with moderate impact   | 50%+1 wins                                    | Minority may disengage; doesn't resolve root disagreement |
| **Expert / Delegated** | Specialized technical decisions             | One trusted person decides                    | Others may feel excluded; expert may have blind spots |
| **PM/Scrum Master Decides** | When team is deadlocked                     | Designated tie-breaker                        | Lower buy-in; can become a crutch       |
| **Sponsor Decides**   | Cross-org tradeoffs beyond team authority   | Escalated decision                            | Slow; should be rare                    |

### The Consent Model (Sociocracy)
A powerful alternative to consensus: "Do you have a **principled objection** to this proposal?" If no one has a substantive blocker, the proposal passes. Faster than consensus but still collaborative.

### Decision Logging Template
| Decision ID | Date       | Decision                   | Context                                     | Alternatives Considered   | Decider   | Status |
| :---------- | :--------- | :------------------------- | :------------------------------------------ | :------------------------ | :-------- | :----- |
| D-001       | 2026-01-15 | Use PostgreSQL for main DB | Need ACID compliance, team expertise        | MySQL, MongoDB            | Dev Lead  | Final  |
| D-002       | 2026-01-16 | Sprint length = 2 weeks    | Balance between predictability and adaptability | 1 week, 3 weeks           | Team consensus | Final  |

---

## 🧯 Conflict & Escalation Path (Put This in the Charter)
Conflict is inevitable. Chaos is optional.

### The Escalation Ladder
1.  **Self-resolution**: Parties address the issue directly (assume positive intent)
2.  **Facilitated session**: PM/Scrum Master helps clarify facts, options, and tradeoffs
3.  **Wider alignment**: Involve functional managers or impacted stakeholders for constraints
4.  **Escalate (last)**: Sponsor/steering committee decides when authority is required

### When to Escalate
| Escalate When...                        | Don't Escalate When...              |
| :-------------------------------------- | :---------------------------------- |
| Decision is outside team authority      | Team can resolve with facilitation  |
| Conflict impacts project viability      | Conflict is healthy technical debate |
| Resource constraint can't be negotiated | Negotiation hasn't been tried       |
| Safety or compliance is at risk         | Issue is preference, not principle  |

### The "24-Hour Rule"
If a conflict isn't resolved within 24 hours of surfacing, escalate to the next level. This prevents issues from festering.

---

## 🔄 Charter Maintenance: Keep It Alive
A charter that's created and forgotten is worthless.

### Review Triggers
*   After every retrospective
*   When team membership changes
*   After major project phase transitions
*   When recurring problems indicate a gap

### Charter Health Check Questions
*   Are we following our own ground rules?
*   Is our decision model working or causing delays?
*   Are communication norms creating clarity or confusion?
*   Does our DoD still reflect quality expectations?

<div class="study-tip">
  <strong>📝 Exam Insight:</strong> If a team is having constant minor behavioral issues (e.g., people interrupting each other), the correct action is to <strong>refer the team to the Ground Rules</strong> or facilitate a session to <strong>update the Team Charter</strong>. If they're confused about what "done" means, they need a <strong>Definition of Done</strong>.
</div>
