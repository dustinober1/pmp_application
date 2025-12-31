# Requirements Document

## Introduction

A comprehensive PMP (Project Management Professional) Study Application designed for the 2026 PMP exam (effective June 2026). The application provides study guides, flashcards, and practice questions organized by PMI's Exam Content Outline domains and tasks. It features a tiered subscription model via PayPal, personalized dashboards with performance analytics, and PMP formulas/statistics integration.

## Glossary

- **Domain**: A major content area in the PMI Exam Content Outline (People, Process, Business Environment)
- **Task**: A specific competency within a Domain that candidates must demonstrate
- **Flashcard**: A digital study card with a question/term on one side and answer/definition on the other
- **Practice_Question**: A multiple-choice question simulating actual PMP exam format
- **Study_Guide**: Structured educational content explaining concepts within a Domain/Task
- **User**: A registered individual using the application to study for the PMP exam
- **Subscription_Tier**: A pricing level determining feature access (Free, Mid-Level, High-End, Corporate)
- **Dashboard**: A personalized interface displaying user progress, statistics, and recommendations
- **Formula**: A mathematical equation used in project management calculations (EVM, scheduling, etc.)
- **PayPal_Integration**: The payment processing system for subscription management

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a prospective PMP candidate, I want to create an account and securely log in, so that I can access personalized study materials and track my progress.

#### Acceptance Criteria

1. WHEN a user submits valid registration information (email, password, name) THEN THE System SHALL create a new user account and send a verification email
2. WHEN a user attempts to register with an existing email THEN THE System SHALL display an error message and prevent duplicate account creation
3. WHEN a user enters valid credentials THEN THE System SHALL authenticate the user and establish a secure session
4. IF a user enters invalid credentials THEN THE System SHALL display an appropriate error message and increment failed login attempts
5. WHEN failed login attempts exceed 5 within 15 minutes THEN THE System SHALL temporarily lock the account and notify the user
6. WHEN a user requests password reset THEN THE System SHALL send a secure reset link valid for 24 hours

### Requirement 2: Subscription Tier Management

**User Story:** As a user, I want to choose from different subscription tiers, so that I can access features appropriate to my study needs and budget.

#### Acceptance Criteria

1. THE System SHALL provide four subscription tiers: Free, Mid-Level, High-End, and Corporate
2. WHEN a user is on Free tier THEN THE System SHALL provide access to limited study guides, 50 flashcards, and 25 practice questions per domain
3. WHEN a user is on Mid-Level tier THEN THE System SHALL provide full study guides, unlimited flashcards, 100 practice questions per domain, and basic analytics
4. WHEN a user is on High-End tier THEN THE System SHALL provide all Mid-Level features plus advanced analytics, formula calculator, mock exams, and personalized study plans
5. WHEN a user is on Corporate tier THEN THE System SHALL provide all High-End features plus team management, bulk licensing, progress reporting for administrators, and dedicated support
6. WHEN a user upgrades or downgrades their tier THEN THE System SHALL immediately adjust feature access and prorate billing accordingly

### Requirement 3: PayPal Payment Integration

**User Story:** As a user, I want to pay for my subscription using PayPal, so that I can securely manage my payments through a trusted platform.

#### Acceptance Criteria

1. WHEN a user selects a paid subscription tier THEN THE System SHALL redirect to PayPal for secure payment processing
2. WHEN PayPal confirms successful payment THEN THE System SHALL activate the subscription and update user access immediately
3. IF PayPal payment fails THEN THE System SHALL display an error message and maintain current subscription status
4. WHEN a subscription renewal is due THEN THE System SHALL process automatic payment via PayPal and notify the user
5. IF automatic renewal payment fails THEN THE System SHALL notify the user and provide a 7-day grace period before downgrading access
6. WHEN a user cancels their subscription THEN THE System SHALL process the cancellation and maintain access until the current billing period ends
7. THE System SHALL store PayPal transaction records for billing history and support inquiries

### Requirement 4: Study Guides by Domain and Task

**User Story:** As a PMP candidate, I want to access comprehensive study guides organized by domain and task, so that I can systematically learn the exam content.

#### Acceptance Criteria

1. THE System SHALL organize study guides according to the 2026 PMI Exam Content Outline domains (People, Process, Business Environment)
2. WHEN a user selects a domain THEN THE System SHALL display all tasks within that domain with completion status
3. WHEN a user opens a study guide THEN THE System SHALL display structured content including key concepts, examples, and related formulas
4. WHEN a user completes reading a study guide section THEN THE System SHALL mark it as complete and update progress tracking
5. THE System SHALL provide search functionality to find specific topics across all study guides
6. WHILE a user is viewing a study guide THEN THE System SHALL display related flashcards and practice questions for that topic

### Requirement 5: Flashcards by Domain and Task

**User Story:** As a PMP candidate, I want to study using flashcards organized by domain and task, so that I can memorize key concepts and terminology efficiently.

#### Acceptance Criteria

1. THE System SHALL organize flashcards by domain and task matching the 2026 PMI Exam Content Outline
2. WHEN a user starts a flashcard session THEN THE System SHALL present cards one at a time with the question/term visible
3. WHEN a user clicks to reveal THEN THE System SHALL display the answer/definition on the flashcard
4. WHEN a user rates their knowledge (Know It, Learning, Don't Know) THEN THE System SHALL record the response and adjust spaced repetition scheduling
5. THE System SHALL implement spaced repetition algorithm to prioritize cards the user struggles with
6. WHEN a user completes a flashcard session THEN THE System SHALL display session statistics including cards reviewed, accuracy rate, and time spent
7. WHERE the user has High-End or Corporate tier THEN THE System SHALL allow creation of custom flashcards

### Requirement 6: Practice Questions by Domain and Task

**User Story:** As a PMP candidate, I want to practice with exam-style questions organized by domain and task, so that I can assess my readiness and identify weak areas.

#### Acceptance Criteria

1. THE System SHALL provide practice questions in PMI exam format (multiple choice with 4 options) organized by domain and task
2. WHEN a user starts a practice session THEN THE System SHALL allow selection of specific domains, tasks, or random mix
3. WHEN a user submits an answer THEN THE System SHALL immediately indicate correct/incorrect and display detailed explanation
4. WHEN a user completes a practice session THEN THE System SHALL display results including score, time per question, and domain breakdown
5. THE System SHALL track question history to avoid repetition until all questions in a category are exhausted
6. IF a user answers incorrectly THEN THE System SHALL flag the question for review and increase its frequency in future sessions
7. WHERE the user has High-End or Corporate tier THEN THE System SHALL provide timed mock exams simulating actual PMP exam conditions

### Requirement 7: PMP Formulas and Calculations

**User Story:** As a PMP candidate, I want to learn and practice PMP formulas, so that I can confidently solve calculation-based exam questions.

#### Acceptance Criteria

1. THE System SHALL provide a comprehensive formula reference including EVM formulas, scheduling calculations, and statistical concepts
2. WHEN a user views a formula THEN THE System SHALL display the formula, variable definitions, example calculations, and when to use it
3. WHERE the user has High-End or Corporate tier THEN THE System SHALL provide an interactive formula calculator for practice
4. WHEN a user enters values into the formula calculator THEN THE System SHALL compute results and show step-by-step solution
5. THE System SHALL include formula-specific practice questions linked to each formula
6. WHEN a user is studying a topic with related formulas THEN THE System SHALL display relevant formula references

### Requirement 8: User Dashboard and Analytics

**User Story:** As a PMP candidate, I want a personalized dashboard showing my progress and statistics, so that I can track my study effectiveness and focus on weak areas.

#### Acceptance Criteria

1. WHEN a user logs in THEN THE System SHALL display their personalized dashboard as the landing page
2. THE Dashboard SHALL display overall progress percentage across all domains and tasks
3. THE Dashboard SHALL display study streak (consecutive days studied) and total study time
4. THE Dashboard SHALL display performance breakdown by domain showing strengths and weaknesses
5. WHEN practice questions are completed THEN THE Dashboard SHALL update accuracy statistics in real-time
6. WHERE the user has Mid-Level tier or higher THEN THE Dashboard SHALL display predicted exam readiness score based on performance
7. WHERE the user has High-End or Corporate tier THEN THE Dashboard SHALL provide personalized study recommendations based on weak areas
8. THE Dashboard SHALL display recent activity including last studied topics and upcoming review items

### Requirement 9: Corporate Team Management

**User Story:** As a corporate administrator, I want to manage team members and view their progress, so that I can ensure my organization's PMP candidates are on track.

#### Acceptance Criteria

1. WHERE the user has Corporate tier THEN THE System SHALL provide team management functionality
2. WHEN an administrator adds team members THEN THE System SHALL send invitation emails and provision accounts
3. WHEN an administrator views the team dashboard THEN THE System SHALL display aggregate progress and individual member statistics
4. THE System SHALL allow administrators to set study goals and deadlines for team members
5. WHEN a team member falls behind on goals THEN THE System SHALL notify the administrator
6. THE System SHALL provide exportable progress reports for corporate compliance and training records
7. WHEN an administrator removes a team member THEN THE System SHALL revoke access while preserving historical data for reporting

### Requirement 10: Content Alignment with 2026 PMP Exam

**User Story:** As a PMP candidate, I want study materials aligned with the 2026 PMP exam content outline, so that I am prepared for the current exam format.

#### Acceptance Criteria

1. THE System SHALL structure all content according to the PMI 2026 Exam Content Outline effective June 2026
2. THE System SHALL clearly label content with the applicable domain and task identifiers
3. WHEN PMI updates the exam content outline THEN THE System SHALL provide a mechanism to update content accordingly
4. THE System SHALL include agile, predictive, and hybrid methodology content as specified in the 2026 outline
5. THE System SHALL display the exam content outline structure for user reference

### Requirement 11: Progress Persistence and Synchronization

**User Story:** As a user, I want my progress saved automatically, so that I can continue studying seamlessly across sessions and devices.

#### Acceptance Criteria

1. WHEN a user completes any study activity THEN THE System SHALL automatically save progress to the database
2. WHEN a user logs in from a different device THEN THE System SHALL synchronize and display their current progress
3. IF network connectivity is lost during a study session THEN THE System SHALL cache progress locally and sync when connection is restored
4. THE System SHALL maintain complete history of user activity for analytics and progress tracking
5. WHEN a user's subscription expires THEN THE System SHALL preserve their progress data for 90 days to allow reactivation
