# Frontend Fix Report - Detailed Task Cards

**PMP Study Pro Application**
**Generated:** January 1, 2026
**Total Issues:** 43 (8 Critical, 18 High, 32 Medium/Low)

---

## Table of Contents

- [Critical Issues (Fix Immediately)](#critical-issues-fix-immediately)
- [High Priority Issues](#high-priority-issues)
- [Medium Priority Issues](#medium-priority-issues)
- [Low Priority Enhancements](#low-priority-enhancements)
- [Testing Requirements](#testing-requirements)

---

## Critical Issues (Fix Immediately)

### 🔴 CRITICAL-001: Missing Navbar on Landing Page

**Priority:** 🔴 CRITICAL
**Estimated Time:** 30 minutes
**File:** `packages/web/src/app/page.tsx`
**Lines:** 1-160

**Problem:**
The landing page does not include the Navbar component, leaving users with no navigation options except the CTA buttons.

**Current Code:**

```typescript
// packages/web/src/app/page.tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* NO NAVBAR HERE */}
      <section className="relative overflow-hidden">...</section>
    </main>
  );
}
```

**Fix Instructions:**

1. Import Navbar component at top of file:

```typescript
import { Navbar } from "@/components/Navbar";
```

2. Add Navbar as first element inside main:

```typescript
export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />  {/* ADD THIS */}
      <section className="relative overflow-hidden">...</section>
    </main>
  );
}
```

**Testing:**

- [ ] Navbar appears on landing page at `/`
- [ ] All navigation links work (Dashboard, Study, Flashcards, Practice, Formulas)
- [ ] Mobile hamburger menu works
- [ ] Theme toggle functions
- [ ] Language toggle functions
- [ ] Login/Sign In buttons navigate correctly

**Note:** Since landing page is public, Navbar should show "Sign In" and "Get Started" buttons instead of user menu.

---

### 🔴 CRITICAL-002: Feature Cards Not Clickable

**Priority:** 🔴 CRITICAL
**Estimated Time:** 1 hour
**File:** `packages/web/src/app/page.tsx`
**Lines:** 44-50

**Problem:**
Feature cards have hover effects but no actual navigation. Users expect clicking a card to navigate to that feature.

**Current Code:**

```typescript
{features.map((feature, index) => (
  <div key={index} className="card card-interactive group">
    {/* CARD HAS HOVER EFFECT BUT NO LINK/onClick */}
  </div>
))}
```

**Fix Instructions:**

1. Import Link from Next.js:

```typescript
import Link from "next/link";
```

2. Create mapping of features to routes:

```typescript
const featureRoutes: Record<string, string> = {
  "Comprehensive Study Guides": "/study",
  "Adaptive Flashcards": "/flashcards",
  "Practice Questions": "/practice",
  "Formula Calculator": "/formulas",
};
```

3. Wrap cards in Link components:

```typescript
{features.map((feature, index) => (
  <Link key={index} href={featureRoutes[feature.title] || '#'}>
    <div className="card card-interactive group cursor-pointer">
      {/* Existing card content */}
    </div>
  </Link>
))}
```

**Testing:**

- [ ] Clicking "Comprehensive Study Guides" navigates to `/study`
- [ ] Clicking "Adaptive Flashcards" navigates to `/flashcards`
- [ ] Clicking "Practice Questions" navigates to `/practice`
- [ ] Clicking "Formula Calculator" navigates to `/formulas`
- [ ] Hover effects still work
- [ ] Cursor changes to pointer on hover
- [ ] Navigation works on mobile

---

### 🔴 CRITICAL-003: User Name Null Safety Bug

**Priority:** 🔴 CRITICAL
**Estimated Time:** 15 minutes
**File:** `packages/web/src/app/dashboard/page.tsx`
**Line:** 79

**Problem:**
Dashboard attempts to split user name without checking if it exists, causing crashes when `user.name` is null/undefined.

**Current Code:**

```typescript
<h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
// If user.name is null, this crashes with: "Cannot read property 'split' of undefined"
```

**Fix Instructions:**
Replace line 79 with safe version:

```typescript
const firstName = user?.name ? user.name.split(' ')[0] : 'there';
<h1>Welcome back, {firstName}! 👋</h1>
```

Or more robust version handling edge cases:

```typescript
const getFirstName = (name: string | null | undefined) => {
  if (!name || name.trim() === '') return 'there';
  const parts = name.trim().split(' ');
  return parts[0] || 'there';
};

<h1>Welcome back, {getFirstName(user?.name)}! 👋</h1>
```

**Testing:**

- [ ] Dashboard loads when user.name exists
- [ ] Dashboard loads when user.name is null
- [ ] Dashboard loads when user.name is empty string
- [ ] Dashboard loads when user.name is single word (no spaces)
- [ ] Dashboard loads when user.name has multiple words
- [ ] First name is correctly extracted from full name
- [ ] Shows "Welcome back, there!" when name is missing

---

### 🔴 CRITICAL-004: Mock Exam Timer Continues in Review Mode

**Priority:** 🔴 CRITICAL
**Estimated Time:** 1 hour
**File:** `packages/web/src/app/practice/mock/session/[sessionId]/page.tsx`
**Lines:** 106-123

**Problem:**
Timer doesn't pause when user enters review mode, unfairly consuming exam time while reviewing questions.

**Current Code:**

```typescript
useEffect(() => {
  if (loading || examComplete || !session) return;

  timerRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timerRef.current!);
        void finishExam();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [loading, examComplete, session, finishExam]);
// Timer runs even when showReview is true
```

**Fix Instructions:**

1. Add state to track review mode:

```typescript
const [showReview, setShowReview] = useState(false);
```

2. Modify timer effect to pause in review mode:

```typescript
useEffect(() => {
  if (loading || examComplete || !session || showReview) return;
  // Added showReview check above

  timerRef.current = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timerRef.current!);
        void finishExam();
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
}, [loading, examComplete, session, showReview, finishExam]);
// Added showReview to dependencies
```

3. Update review button to set state:

```typescript
<button onClick={() => setShowReview(true)}>
  Review Answers
</button>
```

**Testing:**

- [ ] Timer counts down during exam
- [ ] Timer pauses when review button clicked
- [ ] Timer displays "PAUSED" in review mode
- [ ] Timer resumes when exiting review mode
- [ ] Timer reaches 0 and auto-submits exam
- [ ] Visual indicator shows timer is paused
- [ ] Time remaining is accurate after pause/resume

---

### 🔴 CRITICAL-005: All Checkout Tests Broken

**Priority:** 🔴 CRITICAL
**Estimated Time:** 2 hours
**File:** `packages/web/src/app/checkout/page.test.tsx`
**Lines:** 24-136

**Problem:**
All 9 checkout tests fail because:

1. Tests don't wrap component in AuthProvider
2. Tests reference old PayPal flow but code uses Stripe

**Current Code:**

```typescript
// packages/web/src/app/checkout/page.test.tsx

// Line 24-29: Missing AuthProvider
render(
  <CheckoutPage />
  // Should be wrapped in AuthProvider
);

// Line 41-48: References PayPal
it('renders PayPal button', async () => {
  expect(screen.getByText('Pay')).toBeInTheDocument();
  expect(screen.getByText('Pal')).toBeInTheDocument();
  // But actual code uses Stripe
});
```

**Fix Instructions:**

1. Import AuthProvider:

```typescript
import { AuthProvider } from "@/contexts/AuthContext";
```

2. Create test wrapper helper:

```typescript
function createMockWrapper() {
  return ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>
      <MockQueryClientProvider>
        {children}
      </MockQueryClientProvider>
    </AuthProvider>
  );
}
```

3. Update all tests to use wrapper:

```typescript
beforeEach(() => {
  render(<CheckoutPage />, { wrapper: createMockWrapper() });
});
```

4. Replace PayPal references with Stripe:

```typescript
// OLD (Line 41-47):
it("renders PayPal button", async () => {
  expect(screen.getByText("Pay")).toBeInTheDocument();
  expect(screen.getByText("Pal")).toBeInTheDocument();
});

// NEW:
it("renders Stripe checkout button", async () => {
  const button = await screen.findByRole("button", {
    name: /pay with credit card/i,
  });
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute("disabled"); // Disabled when loading
});
```

5. Update API endpoint test:

```typescript
// OLD (Line 63-69):
expect(mockApiRequest).toHaveBeenCalledWith("/subscriptions/upgrade-tier", {
  method: "POST",
  body: {
    tierId: "high-end",
    paymentId: expect.stringContaining("mock_pay_"),
  },
});

// NEW:
expect(mockApiRequest).toHaveBeenCalledWith("/subscriptions/stripe/checkout", {
  method: "POST",
  body: {
    tierId: "high-end",
  },
});
```

6. Add Stripe redirect test:

```typescript
it("redirects to Stripe checkout on button click", async () => {
  mockApiRequest.mockResolvedValue({
    data: { checkoutUrl: "https://checkout.stripe.com/pay/test" },
  });

  const button = screen.getByRole("button", { name: /pay with credit card/i });
  fireEvent.click(button);

  await waitFor(() => {
    expect(window.location.href).toBe("https://checkout.stripe.com/pay/test");
  });
});
```

**Testing:**

- [ ] All 9 checkout tests pass
- [ ] AuthProvider provides context correctly
- [ ] Stripe button renders and is clickable
- [ ] Stripe checkout API is called with correct endpoint
- [ ] Redirect to Stripe URL works
- [ ] Loading state disables button
- [ ] Error state displays message
- [ ] Order summary shows correct tier and price

---

### 🔴 CRITICAL-006: Missing Flag Button in Practice Sessions

**Priority:** 🔴 CRITICAL
**Estimated Time:** 1.5 hours
**File:** `packages/web/src/app/practice/session/[sessionId]/page.tsx`
**Lines:** 249-308

**Problem:**
API supports flagging questions (practice.routes.ts lines 196-234) but UI has no flag button. Users can't flag questions during practice.

**Current Code:**

```typescript
// Question display section
<div className="question-container">
  <h2>{currentQuestion.questionText}</h2>
  {/* NO FLAG BUTTON HERE */}
  <div className="options">
    {options.map(option => (
      <button key={option.id}>{option.text}</button>
    ))}
  </div>
</div>
```

**Fix Instructions:**

1. Add state for flagged questions:

```typescript
const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(
  new Set(),
);
```

2. Add flag toggle function:

```typescript
const toggleFlag = async (questionId: string) => {
  const isFlagged = flaggedQuestions.has(questionId);

  try {
    await apiRequest(
      `/practice/sessions/${sessionId}/questions/${questionId}/flag`,
      {
        method: isFlagged ? "DELETE" : "POST",
      },
    );

    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (isFlagged) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });

    toast.success(isFlagged ? "Question unflagged" : "Question flagged");
  } catch (error) {
    toast.error("Failed to flag question");
  }
};
```

3. Add flag button to question header:

```typescript
<div className="flex items-center justify-between mb-4">
  <span className="text-sm text-gray-400">
    Question {currentIndex + 1} of {session.questions.length}
  </span>

  <button
    onClick={() => toggleFlag(currentQuestion.id)}
    className={`
      flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
      ${flaggedQuestions.has(currentQuestion.id)
        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
        : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-700/50'
      }
    `}
    aria-label={flaggedQuestions.has(currentQuestion.id) ? 'Unflag question' : 'Flag question'}
  >
    <span className="text-lg">{flaggedQuestions.has(currentQuestion.id) ? '★' : '☆'}</span>
    <span className="text-sm">{flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag'}</span>
  </button>
</div>
```

4. Initialize flagged state on load:

```typescript
useEffect(() => {
  // Load existing flagged questions
  apiRequest<{ flagged: string[] }>(`/practice/sessions/${sessionId}/flagged`)
    .then((res) => setFlaggedQuestions(new Set(res.data.flagged)))
    .catch(() => {}); // Silently fail if endpoint doesn't exist yet
}, [sessionId]);
```

**Testing:**

- [ ] Flag button appears in question header
- [ ] Clicking flag button toggles flag state
- [ ] Flag button style changes (gray → yellow)
- [ ] Icon changes (☆ → ★)
- [ ] Text changes (Flag → Flagged)
- [ ] API is called with correct method (POST/DELETE)
- [ ] Toast notification appears
- [ ] Flag state persists when navigating between questions
- [ ] Flag state persists on page refresh
- [ ] Flag button has proper ARIA label
- [ ] Keyboard accessible (Enter/Space to toggle)

---

### 🔴 CRITICAL-007: Flashcard "Due Today" Count Inaccurate

**Priority:** 🔴 CRITICAL
**Estimated Time:** 45 minutes
**File:** `packages/web/src/app/flashcards/page.tsx`
**Lines:** 30-33

**Problem:**
"Due Today" count comes from `/flashcards/review?limit=10`, which caps results at 10. If user has 11+ due cards, count is incorrect.

**Current Code:**

```typescript
const [stats, setStats] = useState<ReviewStats | null>(null);
const [dueCards, setDueCards] = useState<Flashcard[]>([]);

useEffect(() => {
  Promise.all([
    apiRequest<ReviewStats>("/flashcards/stats").then((r) => setStats(r.data)),
    apiRequest<Flashcard[]>("/flashcards/review?limit=10").then((r) =>
      setDueCards(r.data),
    ),
    // ^^^ PROBLEM: limit=10 caps count
  ]);
}, []);
```

**Fix Instructions:**

**Option A: Increase Limit (Quick Fix)**

```typescript
apiRequest<Flashcard[]>("/flashcards/review?limit=1000").then((r) =>
  setDueCards(r.data),
);
// Then display: Math.min(dueCards.length, 10) cards, but show actual count
```

**Option B: Dedicated Stats Endpoint (Better)**

1. Add new endpoint in `flashcard.routes.ts`:

```typescript
router.get("/stats/due-count", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const count = await FlashcardRepository.getDueCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
});
```

2. Implement repository method:

```typescript
async getDueCount(userId: string): Promise<number> {
  const due = await prisma.flashcardReview.findMany({
    where: {
      flashcard: { userId },
      nextReviewDate: { lte: new Date() }
    }
  });

  return due.length;
}
```

3. Use new endpoint in page:

```typescript
const [dueCount, setDueCount] = useState(0);

useEffect(() => {
  Promise.all([
    apiRequest<ReviewStats>("/flashcards/stats").then((r) => setStats(r.data)),
    apiRequest<{ count: number }>("/flashcards/stats/due-count").then((r) =>
      setDueCount(r.data.count),
    ),
    apiRequest<Flashcard[]>("/flashcards/review?limit=10").then((r) =>
      setDueCards(r.data),
    ),
  ]);
}, []);
```

4. Update display:

```typescript
<div className="stat-card">
  <p className="text-3xl font-bold">{dueCount}</p>
  <p className="text-sm text-gray-400">Due Today</p>
</div>
```

**Testing:**

- [ ] Due count shows 0 when no cards due
- [ ] Due count shows accurate number when 1-10 cards due
- [ ] Due count shows accurate number when 11+ cards due (not capped at 10)
- [ ] Due count updates after reviewing cards
- [ ] Performance is good even with 1000+ due cards
- [ ] API response time is under 500ms

---

### 🔴 CRITICAL-008: Markdown XSS Vulnerability

**Priority:** 🔴 CRITICAL
**Estimated Time:** 2 hours
**File:** `packages/web/src/app/study/[taskId]/page.tsx`
**Lines:** 191-193

**Problem:**
While using `rehypeSanitize`, there are no actual XSS tests to verify malicious content is properly sanitized.

**Current Code:**

```typescript
<ReactMarkdown rehypePlugins={[rehypeSanitize]}>
  {section.content}
</ReactMarkdown>
// Sanitize plugin exists but not tested
```

**Fix Instructions:**

1. Install DOMPurify for additional protection:

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

2. Create custom sanitizer component:

```typescript
// components/SanitizedMarkdown.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import DOMPurify from 'dompurify';

interface SanitizedMarkdownProps {
  content: string;
  className?: string;
}

export const SanitizedMarkdown: React.FC<SanitizedMarkdownProps> = ({ content, className }) => {
  // Double sanitization
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'code', 'pre', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
  });

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeSanitize]}
      className={className}
    >
      {sanitizedContent}
    </ReactMarkdown>
  );
};
```

3. Update study task page:

```typescript
import { SanitizedMarkdown } from '@/components/SanitizedMarkdown';

// Replace ReactMarkdown with SanitizedMarkdown:
<SanitizedMarkdown content={section.content} className="prose prose-invert max-w-none" />
```

4. Create comprehensive XSS test suite:

````typescript
// study/[taskId]/page.security.test.tsx
import { render, screen } from '@testing-library/react';
import { StudyTaskPage } from './page';

describe('StudyTaskPage - XSS Prevention', () => {
  it('strips script tags', async () => {
    const maliciousContent = `
      # Test Content
      <script>alert('XSS')</script>
      <p>Valid content</p>
    `;

    // Mock API to return malicious content
    mockApiRequest.mockResolvedValue({
      data: {
        task: { id: '1', title: 'Test', content: maliciousContent }
      }
    });

    render(<StudyTaskPage />);

    expect(screen.queryByText(/alert\('XSS'\)/)).not.toBeInTheDocument();
    expect(screen.getByText('Valid content')).toBeInTheDocument();
  });

  it('strips onclick attributes', async () => {
    const maliciousContent = `
      <p onclick="alert('XSS')">Click me</p>
    `;

    mockApiRequest.mockResolvedValue({
      data: { task: { id: '1', title: 'Test', content: maliciousContent } }
    });

    render(<StudyTaskPage />);

    const paragraph = screen.getByText('Click me');
    expect(paragraph).not.toHaveAttribute('onclick');
  });

  it('strips iframe tags', async () => {
    const maliciousContent = `
      <iframe src="javascript:alert('XSS')"></iframe>
      <p>Valid content</p>
    `;

    mockApiRequest.mockResolvedValue({
      data: { task: { id: '1', title: 'Test', content: maliciousContent } }
    });

    render(<StudyTaskPage />);

    expect(screen.queryByTitle('iframe')).not.toBeInTheDocument();
  });

  it('strips img src with javascript:', async () => {
    const maliciousContent = `
      <img src="x" onerror="alert('XSS')">
      <img src="javascript:alert('XSS')">
    `;

    mockApiRequest.mockResolvedValue({
      data: { task: { id: '1', title: 'Test', content: maliciousContent } }
    });

    render(<StudyTaskPage />);

    const images = screen.queryAllByRole('img');
    expect(images.length).toBe(0);
  });

  it('allows safe markdown', async () => {
    const safeContent = `
      # Heading 1
      ## Heading 2

      **Bold text** and *italic text*

      - List item 1
      - List item 2

      [Link](https://example.com)

      \`inline code\`

      ```
      code block
      ```
    `;

    mockApiRequest.mockResolvedValue({
      data: { task: { id: '1', title: 'Test', content: safeContent } }
    });

    render(<StudyTaskPage />);

    expect(screen.getByText('Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Bold text')).toBeInTheDocument();
    expect(screen.getByText('italic text')).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument();
  });
});
````

**Testing:**

- [ ] Script tags are completely removed
- [ ] Event handlers (onclick, onerror, etc.) are removed
- [ ] iframe tags are removed
- [ ] Dangerous img src attributes are removed
- [ ] Safe markdown renders correctly
- [ ] Links with safe href attributes work
- [ ] Code blocks render correctly
- [ ] No JavaScript executes from malicious content
- [ ] All 5+ XSS tests pass

---

## High Priority Issues

### 🟡 HIGH-001: "Remember Me" Checkbox Not Functional

**Priority:** 🟡 HIGH
**Estimated Time:** 1.5 hours
**File:** `packages/web/src/app/auth/login/page.tsx`
**Lines:** 104-110

**Problem:**
Checkbox exists but not connected to state or API. User expectation not met.

**Current Code:**

```typescript
<label className="flex items-center gap-2">
  <input type="checkbox" className="..." />
  {/* NO STATE BINDING */}
  <span>Remember me</span>
</label>
```

**Fix Instructions:**

1. Add state:

```typescript
const [rememberMe, setRememberMe] = useState(false);
```

2. Bind checkbox:

```typescript
<input
  type="checkbox"
  checked={rememberMe}
  onChange={(e) => setRememberMe(e.target.checked)}
  className="..."
/>
```

3. Include in login API call:

```typescript
const response = await apiRequest("/auth/login", {
  method: "POST",
  body: {
    email,
    password,
    rememberMe, // ADD THIS
  },
});
```

4. Backend handling (if not implemented):

```typescript
// auth.routes.ts - Login endpoint
if (rememberMe) {
  // Set longer-lived token (30 days instead of 1 day)
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
  // Set cookie with 30-day expiry
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
}
```

**Testing:**

- [ ] Checkbox state toggles on click
- [ ] Checkbox state persists on form re-render
- [ ] Login API receives rememberMe boolean
- [ ] When checked, session lasts longer (test token expiry)
- [ ] When unchecked, session uses default expiry
- [ ] Unchecking works after checking

---

### 🟡 HIGH-002: No Email Format Validation

**Priority:** 🟡 HIGH
**Estimated Time:** 1 hour
**Files:**

- `packages/web/src/app/auth/login/page.tsx` (Lines 74-82)
- `packages/web/src/app/auth/register/page.tsx` (Lines 101-109)
- `packages/web/src/app/auth/forgot-password/page.tsx` (Lines 80-90)

**Problem:**
Forms rely only on browser's `type="email"` validation, which is inconsistent across browsers.

**Current Code:**

```typescript
<input
  type="email" // ONLY BROWSER VALIDATION
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="..."
/>
```

**Fix Instructions:**

1. Create validation utility:

```typescript
// lib/validation.ts
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getPasswordErrors = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return errors;
};
```

2. Add validation to login form:

```typescript
import { validateEmail } from "@/lib/validation";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate email format
  if (!validateEmail(email)) {
    setError("Please enter a valid email address");
    return;
  }

  // Validate password not empty
  if (!password.trim()) {
    setError("Please enter your password");
    return;
  }

  // Proceed with login...
};
```

3. Add real-time validation feedback:

```typescript
const [emailTouched, setEmailTouched] = useState(false);
const [emailError, setEmailError] = useState('');

<input
  type="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    if (emailTouched) {
      setEmailError(validateEmail(e.target.value) ? '' : 'Invalid email format');
    }
  }}
  onBlur={() => setEmailTouched(true)}
  className={emailError ? 'border-red-500' : ''}
/>
{emailError && (
  <p className="text-red-500 text-sm mt-1">{emailError}</p>
)}
```

**Testing:**

- [ ] Valid email: `user@example.com` - passes
- [ ] Invalid email: `user` - shows error
- [ ] Invalid email: `user@` - shows error
- [ ] Invalid email: `@example.com` - shows error
- [ ] Invalid email: `user@.com` - shows error
- [ ] Edge case: `user+tag@example.com` - passes
- [ ] Edge case: `user.name@example.co.uk` - passes
- [ ] Error appears on blur after typing invalid email
- [ ] Error clears when valid email entered
- [ ] Form doesn't submit with invalid email

---

### 🟡 HIGH-003: Terms Checkbox Not State-Managed

**Priority:** 🟡 HIGH
**Estimated Time:** 30 minutes
**File:** `packages/web/src/app/auth/register/page.tsx`
**Lines:** 150-166

**Problem:**
Checkbox has `required` attribute but no state tracking. Can't programmatically check user agreement.

**Current Code:**

```typescript
<input type="checkbox" className="..." required />
```

**Fix Instructions:**

1. Add state:

```typescript
const [agreedToTerms, setAgreedToTerms] = useState(false);
```

2. Bind checkbox:

```typescript
<input
  type="checkbox"
  checked={agreedToTerms}
  onChange={(e) => setAgreedToTerms(e.target.checked)}
  required
  className="..."
/>
```

3. Add explicit validation:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!agreedToTerms) {
    setError("You must agree to the Terms of Service");
    return;
  }

  // Proceed with registration...
};
```

**Testing:**

- [ ] Checkbox state toggles on click
- [ ] Can't submit form when unchecked
- [ ] Can submit form when checked
- [ ] Error message displays when trying to submit without agreeing
- [ ] Checkbox is checked by default (if desired)
- [ ] Tab order reaches checkbox correctly
- [ ] Spacebar toggles checkbox

---

### 🟡 HIGH-004: Progress Calculation Bug on Resume

**Priority:** 🟡 HIGH
**Estimated Time:** 45 minutes
**File:** `packages/web/src/app/flashcards/session/[sessionId]/page.tsx`
**Lines:** 186-187

**Problem:**
Progress uses `currentIndex` but initial state uses `session.progress.answered`. On refresh, progress resets to 0.

**Current Code:**

```typescript
const progress =
  session.cards.length > 0
    ? Math.round((currentIndex / session.cards.length) * 100)
    : 0;
// Should use session.progress.answered instead
```

**Fix Instructions:**

```typescript
// Use answered count from session data
const progress =
  session.cards.length > 0
    ? Math.round((session.progress.answered / session.progress.total) * 100)
    : 0;
```

But also track `currentIndex` properly:

```typescript
// Initialize from session data
const [currentIndex, setCurrentIndex] = useState(
  response.data.progress.answered > 0
    ? response.data.progress.answered - 1 // Convert to 0-indexed
    : 0,
);
```

And ensure API returns correct progress:

```typescript
// flashcard.service.ts
return {
  progress: {
    total: session.cards.length,
    answered: session.cards.filter((c) => c.rating !== null).length,
    correct: session.cards.filter((c) => c.rating === "know_it").length,
  },
};
```

**Testing:**

- [ ] Progress shows 0% on new session
- [ ] Progress updates correctly as cards are rated
- [ ] Progress persists after page refresh
- [ ] Progress bar displays correct percentage
- [ ] "Card X of Y" text is accurate
- [ ] Progress reaches 100% when all cards rated

---

### 🟡 HIGH-005: No Previous Button in Practice Sessions

**Priority:** 🟡 HIGH
**Estimated Time:** 1 hour
**File:** `packages/web/src/app/practice/session/[sessionId]/page.tsx`
**Lines:** 334-357

**Problem:**
Users can't go back to review or change answers. Missing common functionality.

**Current Code:**

```typescript
{/* ONLY HAS NEXT/SUBMIT BUTTON */}
<div className="flex justify-between">
  <div></div> {/* EMPTY - NO PREVIOUS BUTTON */}
  <button onClick={handleNext}>Next</button>
</div>
```

**Fix Instructions:**

1. Add Previous button:

```typescript
<div className="flex justify-between">
  <button
    onClick={handlePrevious}
    disabled={currentIndex === 0 || !!feedback || isSubmitting}
    className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
  >
    Previous
  </button>

  <button onClick={handleNext}>
    {currentIndex === session.questions.length - 1 ? 'Finish Session' : 'Next'}
  </button>
</div>
```

2. Add handler:

```typescript
const handlePrevious = () => {
  if (currentIndex > 0) {
    setCurrentIndex((prev) => prev - 1);
    setFeedback(null); // Clear feedback when going back
    setSelectedOptionId(null); // Clear selection
  }
};
```

3. Consider allowing answer change:

```typescript
// If feedback shown, user can still go back but warn them
const handlePrevious = () => {
  if (currentIndex > 0) {
    if (feedback) {
      const confirm = window.confirm(
        "You have already answered this question. Go back and change your answer?",
      );
      if (!confirm) return;
    }
    setCurrentIndex((prev) => prev - 1);
    setFeedback(null);
    setSelectedOptionId(null);
  }
};
```

**Testing:**

- [ ] Previous button disabled on first question
- [ ] Previous button enabled on questions 2+
- [ ] Clicking Previous goes to prior question
- [ ] Previous button disabled after submitting answer (optional)
- [ ] Answer selection clears when going back
- [ ] Feedback clears when going back
- [ ] Can change answer after going back
- [ ] Confirmation dialog shows if trying to go back after answering
- [ ] Next button text changes to "Finish Session" on last question

---

### 🟡 HIGH-006: No Active Link Highlighting in Navbar

**Priority:** 🟡 HIGH
**Estimated Time:** 1 hour
**File:** `packages/web/src/components/Navbar.tsx`
**Lines:** 62-101

**Problem:**
Navigation doesn't show which page is currently active. Users lose context.

**Current Code:**

```typescript
<Link href="/dashboard" className="...">
  Dashboard
  {/* NO ACTIVE STATE INDICATOR */}
</Link>
```

**Fix Instructions:**

1. Import pathname hook:

```typescript
import { usePathname } from "next/navigation";
```

2. Get current path in component:

```typescript
const pathname = usePathname();
```

3. Create helper to check active route:

```typescript
const isActiveRoute = (href: string) => {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname?.startsWith(href) || false;
};
```

4. Add active styling to links:

```typescript
<Link
  href="/dashboard"
  className={`
    px-3 py-2 rounded-lg transition-colors
    ${isActiveRoute('/dashboard')
      ? 'bg-md-primary/20 text-md-primary font-medium'
      : 'text-md-on-surface-variant hover:bg-md-surface-variant/20'
    }
  `}
>
  Dashboard
</Link>
```

5. Add aria-current attribute for accessibility:

```typescript
<Link
  href="/dashboard"
  aria-current={isActiveRoute('/dashboard') ? 'page' : undefined}
  className={/* ... */}
>
  Dashboard
</Link>
```

6. Apply to all nav links:

```typescript
const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/study', label: 'Study' },
  { href: '/flashcards', label: 'Flashcards' },
  { href: '/practice', label: 'Practice' },
  { href: '/formulas', label: 'Formulas' },
];

{navLinks.map(({ href, label }) => (
  <Link
    key={href}
    href={href}
    aria-current={isActiveRoute(href) ? 'page' : undefined}
    className={`
      px-3 py-2 rounded-lg transition-colors
      ${isActiveRoute(href)
        ? 'bg-md-primary/20 text-md-primary font-medium'
        : 'text-md-on-surface-variant hover:bg-md-surface-variant/20'
      }
    `}
  >
    {label}
  </Link>
))}
```

**Testing:**

- [ ] Dashboard link highlighted when on `/dashboard`
- [ ] Study link highlighted when on `/study` or `/study/[taskId]`
- [ ] Flashcards link highlighted when on `/flashcards` or any sub-route
- [ ] Practice link highlighted when on `/practice` or any sub-route
- [ ] Formulas link highlighted when on `/formulas`
- [ ] Only one link highlighted at a time
- [ ] Highlighting has visible contrast (background + text color)
- [ ] Hover effect works on inactive links
- [ ] `aria-current="page"` set on active link for screen readers
- [ ] Active state works on mobile menu

---

### 🟡 HIGH-007: Unsafe Date Handling

**Priority:** 🟡 HIGH
**Estimated Time:** 30 minutes
**File:** `packages/web/src/app/dashboard/page.tsx`
**Line:** 250

**Problem:**
No validation that timestamp is valid date. Can result in "Invalid Date" text.

**Current Code:**

```typescript
{
  new Date(activity.timestamp).toLocaleDateString();
}
// If timestamp is malformed, shows "Invalid Date"
```

**Fix Instructions:**

1. Create safe date formatter:

```typescript
const formatDate = (timestamp: string | Date): string => {
  try {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    if (isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown date";
  }
};
```

2. Use in component:

```typescript
<span className="text-sm text-gray-400">
  {formatDate(activity.timestamp)}
</span>
```

3. Or create reusable utility:

```typescript
// lib/dateUtils.ts
export const formatDate = (timestamp: string | Date): string => {
  try {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    if (isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown date";
  }
};

export const formatDateTime = (timestamp: string | Date): string => {
  try {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    if (isNaN(date.getTime())) {
      return "Unknown date";
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown date";
  }
};
```

**Testing:**

- [ ] Valid date string displays correctly
- [ ] Invalid date string shows "Unknown date"
- [ ] Null/undefined timestamp shows "Unknown date"
- [ ] Date object displays correctly
- [ ] ISO 8601 string displays correctly
- [ ] Timestamp in milliseconds displays correctly
- [ ] Malformed string doesn't crash component

---

## Medium Priority Issues

### 🟢 MEDIUM-001: Description Truncation Bug

**Priority:** 🟢 MEDIUM
**Estimated Time:** 1 hour
**Files:**

- `packages/web/src/app/study/page.tsx` (Lines 95, 129)

**Problem:**
Unsafe substring can cut words in half and emojis.

**Current Code:**

```typescript
{domain.description?.substring(0, 100)}...
{task.description?.substring(0, 80)}...
```

**Fix Instructions:**

1. Create smart truncate utility:

```typescript
// lib/stringUtils.ts
export const truncateAtWordBoundary = (
  text: string | undefined,
  maxLength: number,
): string => {
  if (!text) return "";

  if (text.length <= maxLength) return text;

  // Find last complete word before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const lastNewline = truncated.lastIndexOf("\n");
  const lastBoundary = Math.max(lastSpace, lastNewline);

  // If no boundary found, just truncate at maxLength
  if (lastBoundary === -1) {
    return truncated + "...";
  }

  // Truncate at last word boundary
  return text.substring(0, lastBoundary) + "...";
};

export const truncateWithEmojiProtection = (
  text: string | undefined,
  maxLength: number,
): string => {
  if (!text) return "";

  // Simple emoji detection (not perfect but catches most)
  const emojiRegex = /\p{Emoji}/u;
  const truncated = text.substring(0, maxLength);

  // Check if last char is part of an emoji
  if (emojiRegex.test(truncated.slice(-2))) {
    // Remove potential split emoji
    const safeTruncated = truncated.slice(0, -2);
    return truncateAtWordBoundary(safeTruncated, maxLength);
  }

  return truncateAtWordBoundary(text, maxLength);
};
```

2. Use in study guide:

```typescript
import { truncateWithEmojiProtection } from '@/lib/stringUtils';

// For domain descriptions:
<p className="text-sm text-gray-400">
  {truncateWithEmojiProtection(domain.description, 100)}
</p>

// For task descriptions:
<p className="text-sm text-gray-400">
  {truncateWithEmojiProtection(task.description, 80)}
</p>
```

**Testing:**

- [ ] Long text truncated at word boundary
- [ ] Doesn't cut words in half
- [ ] Doesn't cut emojis in half
- [ ] Short text not truncated
- [ ] Ellipsis (...) added after truncation
- [ ] Works with empty string
- [ ] Works with null/undefined
- [ ] Handles newlines correctly

---

### 🟢 MEDIUM-002: No Footer Links

**Priority:** 🟢 MEDIUM
**Estimated Time:** 1.5 hours
**File:** `packages/web/src/app/page.tsx`
**Lines:** 145-159

**Problem:**
Footer only has copyright text, missing legal/navigation links.

**Current Code:**

```typescript
<footer className="py-8 text-center">
  <div className="w-8 h-8 ..."></div> {/* Logo not clickable */}
  <p className="text-sm text-gray-400">© 2025 PMP Study Pro</p>
  {/* NO OTHER LINKS */}
</footer>
```

**Fix Instructions:**

1. Create footer component:

```typescript
// components/Footer.tsx
import Link from 'next/link';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-md-surface border-t border-md-outline-variant py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-md-primary flex items-center justify-center">
                <span className="text-white font-bold">P</span>
              </div>
              <span className="text-lg font-semibold">PMP Study Pro</span>
            </Link>
            <p className="mt-4 text-sm text-gray-400">
              Comprehensive PMP exam preparation with adaptive learning and real-time analytics.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Product</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/#testimonials" className="text-gray-400 hover:text-white transition-colors">Testimonials</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/study-guide" className="text-gray-400 hover:text-white transition-colors">Study Guide</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-400 text-center">
            © {currentYear} PMP Study Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
```

2. Add to landing page:

```typescript
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>{/* ... */}</main>
      <Footer />
    </>
  );
}
```

3. Create placeholder pages for links:

```bash
# Create these pages:
/app/privacy/page.tsx
/app/terms/page.tsx
/app/contact/page.tsx
/app/blog/page.tsx
/app/faq/page.tsx
```

**Testing:**

- [ ] Footer displays on landing page
- [ ] Logo links to home
- [ ] All footer links navigate correctly
- [ ] Hover effects on links
- [ ] Responsive layout (4 columns → 1 column on mobile)
- [ ] Current year updates automatically
- [ ] Copyright notice displays
- [ ] Footer doesn't overlap content
- [ ] Footer accessible via keyboard

---

### 🟢 MEDIUM-003: Missing Password Strength Indicators

**Priority:** 🟢 MEDIUM
**Estimated Time:** 2 hours
**Files:**

- `packages/web/src/app/auth/register/page.tsx`
- `packages/web/src/app/auth/reset-password/page.tsx`

**Problem:**
Users don't know password requirements until validation fails.

**Fix Instructions:**

1. Create password strength component:

```typescript
// components/PasswordStrength.tsx
import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const calculateStrength = (pwd: string): { score: number; label: string; color: string } => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-700' };

    let score = 0;

    // Length
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;

    // Complexity
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, label: 'Fair', color: 'bg-yellow-500' };
    return { score, label: 'Strong', color: 'bg-green-500' };
  };

  const { score, label, color } = calculateStrength(password);

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${color}`}
            style={{ width: `${(score / 6) * 100}%` }}
          />
        </div>
        <span className={`text-xs font-medium ${color.replace('bg-', 'text-')}`}>
          {label}
        </span>
      </div>
      <ul className="text-xs text-gray-400 space-y-1">
        <li className={password.length >= 8 ? 'text-green-400' : ''}>
          ✓ At least 8 characters
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-400' : ''}>
          ✓ Lowercase letter
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-400' : ''}>
          ✓ Uppercase letter
        </li>
        <li className={/\d/.test(password) ? 'text-green-400' : ''}>
          ✓ Number
        </li>
      </ul>
    </div>
  );
};
```

2. Add to registration form:

```typescript
import { PasswordStrength } from '@/components/PasswordStrength';

<input
  type="password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="..."
/>
<PasswordStrength password={password} />
```

3. Add to reset password form as well.

**Testing:**

- [ ] Strength meter appears when typing password
- [ ] Progress bar fills as password gets stronger
- [ ] Color changes: red → yellow → green
- [ ] Label changes: Weak → Fair → Strong
- [ ] Requirements list updates with checkmarks
- [ ] All requirements checked when password is strong
- [ ] Meter clears when password field cleared
- [ ] Accessible (requirements read by screen readers)

---

### 🟢 MEDIUM-004: Expand Navbar Test Coverage

**Priority:** 🟢 MEDIUM
**Estimated Time:** 3 hours
**File:** `packages/web/src/components/Navbar.test.tsx`
**Current:** 3 tests
**Target:** 23 tests

**Problem:**
Only 3 basic tests for complex component with many interactive features.

**Fix Instructions:**
Add comprehensive test suite:

```typescript
// components/Navbar.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

const mockUsePathname = usePathname as jest.Mock;

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  describe('Navigation Links', () => {
    it('renders all navigation links when authenticated', () => {
      render(<Navbar />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Study')).toBeInTheDocument();
      expect(screen.getByText('Flashcards')).toBeInTheDocument();
      expect(screen.getByText('Practice')).toBeInTheDocument();
      expect(screen.getByText('Formulas')).toBeInTheDocument();
    });

    it('navigates to Dashboard when link clicked', () => {
      render(<Navbar />);
      const link = screen.getByText('Dashboard');
      expect(link.closest('a')).toHaveAttribute('href', '/dashboard');
    });

    it('navigates to Study when link clicked', () => {
      render(<Navbar />);
      const link = screen.getByText('Study');
      expect(link.closest('a')).toHaveAttribute('href', '/study');
    });

    it('highlights active route', () => {
      mockUsePathname.mockReturnValue('/study');
      render(<Navbar />);
      const studyLink = screen.getByText('Study').closest('a');
      expect(studyLink).toHaveClass('bg-md-primary/20');
    });
  });

  describe('Theme Toggle', () => {
    it('toggles between light and dark mode', () => {
      render(<Navbar />);
      const toggle = screen.getByLabelText(/toggle theme/i);
      fireEvent.click(toggle);
      // Verify theme changed
    });

    it('shows sun icon in dark mode', () => {
      document.documentElement.classList.add('dark');
      render(<Navbar />);
      expect(screen.getByLabelText(/switch to light mode/i)).toBeInTheDocument();
    });

    it('shows moon icon in light mode', () => {
      document.documentElement.classList.remove('dark');
      render(<Navbar />);
      expect(screen.getByLabelText(/switch to dark mode/i)).toBeInTheDocument();
    });
  });

  describe('Language Toggle', () => {
    it('toggles between EN and ES when clicked', () => {
      render(<Navbar />);
      const toggle = screen.getByText(/EN|ES/);
      fireEvent.click(toggle);
      // Verify language changed
    });

    it('displays current language code', () => {
      render(<Navbar />);
      expect(screen.getByText(/EN/)).toBeInTheDocument();
    });
  });

  describe('User Menu', () => {
    it('displays user name and tier', () => {
      render(<Navbar />);
      expect(screen.getByText(/John Doe/)).toBeInTheDocument();
      expect(screen.getByText(/high-end tier/i)).toBeInTheDocument();
    });

    it('opens menu when user name clicked', () => {
      render(<Navbar />);
      const userName = screen.getByText(/John Doe/);
      fireEvent.click(userName);
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('calls logout when logout button clicked', () => {
      render(<Navbar />);
      fireEvent.click(screen.getByText(/John Doe/));
      fireEvent.click(screen.getByText('Logout'));
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Mobile Menu', () => {
    it('opens mobile menu when hamburger clicked', () => {
      render(<Navbar />);
      const hamburger = screen.getByLabelText(/open menu/i);
      fireEvent.click(hamburger);
      expect(screen.getByText('Dashboard')).toBeVisible();
    });

    it('closes mobile menu when hamburger clicked again', () => {
      render(<Navbar />);
      const hamburger = screen.getByLabelText(/open menu/i);
      fireEvent.click(hamburger);
      fireEvent.click(hamburger);
      // Verify menu closed
    });

    it('closes mobile menu when link clicked', () => {
      render(<Navbar />);
      fireEvent.click(screen.getByLabelText(/open menu/i));
      fireEvent.click(screen.getByText('Dashboard'));
      // Verify menu closed
    });

    it('updates aria-expanded attribute', () => {
      render(<Navbar />);
      const hamburger = screen.getByLabelText(/open menu/i);
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(hamburger);
      expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    });

    it('is hidden on desktop screens', () => {
      render(<Navbar />);
      // Verify desktop nav is visible on large screens
    });
  });

  describe('Search Dialog', () => {
    it('opens search dialog when search button clicked', () => {
      render(<Navbar />);
      const searchBtn = screen.getByLabelText(/open search/i);
      fireEvent.click(searchBtn);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not show search button when not authenticated', () => {
      // Mock unauthenticated state
      render(<Navbar />);
      expect(screen.queryByLabelText(/open search/i)).not.toBeInTheDocument();
    });
  });
});
```

**Testing:**

- [ ] All 23 new tests pass
- [ ] Navigation link tests (5 tests)
- [ ] Theme toggle tests (3 tests)
- [ ] Language toggle tests (2 tests)
- [ ] User menu tests (3 tests)
- [ ] Mobile menu tests (5 tests)
- [ ] Search dialog tests (2 tests)
- [ ] Integration tests (3 tests)

---

## Low Priority Enhancements

### 🔵 LOW-001: Add Swipe Gestures to Flashcards

**Priority:** 🔵 LOW
**Estimated Time:** 3 hours
**File:** `packages/web/src/app/flashcards/session/[sessionId]/page.tsx`

**Fix Instructions:**
Install swipe library:

```bash
npm install react-swipeable
```

Add swipe handlers:

```typescript
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => {
    if (!isFlipped) setIsFlipped(true);
  },
  onSwipedRight: () => {
    if (isFlipped) setIsFlipped(false);
  },
  onSwipedUp: () => {
    handleRate('know_it');
  },
  onSwipedDown: () => {
    handleRate('dont_know');
  },
  preventScrollOnSwipe: true,
  trackMouse: true,
});

<div {...handlers} className="flashcard">
  {/* Card content */}
</div>
```

**Testing:**

- [ ] Swipe left flips card to back
- [ ] Swipe right flips card to front
- [ ] Swipe up rates as "Easy"
- [ ] Swipe down rates as "Again"
- [ ] Touch gestures work on mobile
- [ ] Mouse drag works on desktop
- [ ] Doesn't interfere with scrolling

---

### 🔵 LOW-002: Add Countdown Timer for Reset Password

**Priority:** 🔵 LOW
**Estimated Time:** 1 hour
**File:** `packages/web/src/app/auth/reset-password/page.tsx`
**Line:** 59

**Fix Instructions:**

```typescript
const [countdown, setCountdown] = useState(3);

useEffect(() => {
  if (success) {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }
}, [success]);

// Display:
<p>Redirecting in {countdown} seconds...</p>
```

---

## Testing Requirements

### Unit Tests

- [ ] All existing tests still pass (133+ tests)
- [ ] All new tests pass (50+ new tests)
- [ ] Test coverage increased to 80%+

### Integration Tests

- [ ] Dashboard → Study navigation
- [ ] Study → Task navigation
- [ ] Flashcard session flow
- [ ] Practice session flow
- [ ] Checkout flow

### E2E Tests

- [ ] New user registration flow
- [ ] Login → Dashboard navigation
- [ ] Complete flashcard session
- [ ] Complete practice session
- [ ] Mock exam flow

### Accessibility Tests

- [ ] Keyboard navigation all pages
- [ ] Screen reader compatibility
- [ ] Color contrast ratios (WCAG AA)
- [ ] Focus management
- [ ] ARIA labels complete

### Performance Tests

- [ ] Landing page load < 2s
- [ ] Dashboard load < 1s
- [ ] API response times < 500ms
- [ ] No memory leaks
- [ ] Bundle size optimized

---

## Fix Implementation Order

### Week 1: Critical Fixes

1. CRITICAL-001: Missing Navbar (30 min)
2. CRITICAL-002: Feature cards clickable (1 hr)
3. CRITICAL-003: User name null safety (15 min)
4. CRITICAL-004: Mock exam timer (1 hr)
5. CRITICAL-006: Flag button (1.5 hr)
6. CRITICAL-007: Due today count (45 min)
7. CRITICAL-008: XSS prevention (2 hr)

**Total Week 1:** ~8.5 hours

### Week 2: High Priority

8. CRITICAL-005: Checkout tests (2 hr)
9. HIGH-001: Remember me (1.5 hr)
10. HIGH-002: Email validation (1 hr)
11. HIGH-003: Terms checkbox (30 min)
12. HIGH-004: Progress bug (45 min)
13. HIGH-005: Previous button (1 hr)
14. HIGH-006: Active links (1 hr)
15. HIGH-007: Date handling (30 min)

**Total Week 2:** ~8 hours

### Week 3: Medium Priority

16. MEDIUM-001: Description truncation (1 hr)
17. MEDIUM-002: Footer links (1.5 hr)
18. MEDIUM-003: Password strength (2 hr)
19. MEDIUM-004: Navbar tests (3 hr)
20. Add comprehensive E2E tests (4 hr)
21. Add integration tests (3 hr)

**Total Week 3:** ~14.5 hours

### Week 4: Low Priority & Polish

22. LOW-001: Swipe gestures (3 hr)
23. LOW-002: Countdown timer (1 hr)
24. Accessibility audit (4 hr)
25. Performance optimization (4 hr)
26. Documentation (2 hr)

**Total Week 4:** ~14 hours

**Grand Total:** ~45 hours (6 weeks at 8 hrs/week)

---

## Success Criteria

### Functional Requirements

- [ ] All critical bugs resolved
- [ ] All high priority issues addressed
- [ ] Test coverage ≥ 80%
- [ ] Zero security vulnerabilities
- [ ] All user flows working end-to-end

### Quality Requirements

- [ ] WCAG 2.1 AA compliance
- [ ] Lighthouse score ≥ 90
- [ ] Bundle size < 500KB
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s

### User Experience

- [ ] Professional, consistent design
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Helpful loading states
- [ ] Responsive on all devices

---

## Notes

1. **Dependencies:** Some fixes depend on others (noted in task cards)
2. **Backend Work:** Some fixes require backend changes (noted in instructions)
3. **Testing:** Every fix must include tests
4. **Documentation:** Update inline docs for complex logic
5. **Code Review:** All fixes should be reviewed before merging

---

**Report Version:** 1.0
**Last Updated:** January 1, 2026
**Next Review:** After critical fixes completed
