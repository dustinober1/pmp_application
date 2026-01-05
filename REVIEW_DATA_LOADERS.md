# Data Loaders Code Review - Type Safety, Error Handling, and Data Validation

**Reviewer**: Worker feature-3 (Data Loaders Review)  
**Date**: 2025-01-05  
**Files Analyzed**: 4 (flashcardsData.ts, practiceData.ts, studyData.ts, formulasData.ts)

## Executive Summary

Comprehensive review of data loaders covering type safety, error handling, and data validation.

### Critical Issues Found:
1. **Type mismatches** between local and shared types - Multiple duplicate type definitions
2. **Missing runtime data validation** - No Zod/schema validation for JSON parsing
3. **Inconsistent error handling** - Some functions throw, others return empty/null
4. **Unsafe type assertions** - Using `as` without validation
5. **Missing input validation** - No sanitization for user inputs

### Recommendations Summary:
- **High Priority**: Consolidate type definitions to use only shared types
- **High Priority**: Add runtime validation using Zod or similar
- **Medium Priority**: Standardize error handling patterns
- **Medium Priority**: Add input sanitization functions

---

## Detailed Findings by File

### 1. flashcardsData.ts

**Location**: `packages/web-svelte/src/lib/utils/flashcardsData.ts`

#### Type Safety Issues:
- **Duplicate type definitions**: `Flashcard`, `FlashcardStats`, `DomainBreakdown`, `TaskBreakdown` are defined locally but should use types from `@pmp/shared`
- **Missing fields**: Local `Flashcard` type has `domain`, `task`, `category`, `ecoReference` but shared type doesn't - these are extra metadata not in the canonical type
- **Unsafe type assertions**: Lines 153, 176, 202 use `as FlashcardManifest`, `as FlashcardGroup[]`, `as FlashcardGroup` without runtime validation

#### Error Handling:
- ✅ **Good**: Consistent try-catch with console.error logging
- ⚠️ **Issue**: Generic error messages don't help with debugging (line 158: "Failed to load flashcards")
- ✅ **Good**: `prefetchDomains` silently fails (line 311) - appropriate for non-critical functionality

#### Data Validation:
- 🔴 **Critical**: No validation that fetched JSON matches expected structure
- 🔴 **Missing**: No check for required fields like `id`, `domain`, `task`
- ⚠️ **Risk**: Malformed JSON could cause runtime errors when accessing properties

#### Specific Code Issues:

```typescript
// Line 153: Unsafe type assertion
const data = (await response.json()) as FlashcardManifest;
// Should validate: data.version, data.domains array, etc.

// Line 218: Unsafe fallback
const groupDomainId = DOMAIN_MAP[group.meta.domain] || group.meta.domain.toLowerCase().replace(/\s+/g, '-');
// No validation that group.meta.domain exists or is valid
```

---

### 2. practiceData.ts

**Location**: `packages/web-svelte/src/lib/utils/practiceData.ts`

#### Type Safety Issues:
- **Duplicate type definitions**: `PracticeQuestion`, `DomainBreakdown`, `TaskBreakdown` locally defined but shared types exist in `@pmp/shared`
- **Major mismatch**: Local `PracticeQuestion` has completely different structure than shared type:
  - Local: `domain`, `task`, `taskNumber`, `methodology`, `scenario`, `distractors`, `remediation`
  - Shared: `domainId`, `taskId`, `options`, `correctOptionId`, `explanation`
- **Type mismatch**: These represent DIFFERENT data models - local is the raw testbank format, shared is the application format

#### Error Handling:
- ✅ **Good**: Consistent error handling pattern throughout
- ⚠️ **Issue**: Generic error messages (line 150: "Failed to load practice questions")

#### Data Validation:
- 🔴 **Critical**: No runtime validation of JSON structure
- 🔴 **Missing**: No validation that methodology is one of: `'predictive' | 'agile' | 'hybrid'`

#### Specific Code Issues:

```typescript
// Line 145: Unsafe assertion
const data = (await response.json()) as TestbankData;
// Should validate: data.totalQuestions, data.domains, etc.

// Line 255: Insecure randomization
const shuffled = [...testbank.questions].sort(() => Math.random() - 0.5);
// This is NOT cryptographically secure or evenly distributed
// Use Fisher-Yates shuffle instead
```

---

### 3. studyData.ts

**Location**: `packages/web-svelte/src/lib/utils/studyData.ts`

#### Type Safety Issues:
- ✅ **Good**: Properly imports types from `@pmp/shared` (`Domain`, `Task`, `StudyGuide`, `StudySection`)
- ⚠️ **Inconsistent**: Has local interfaces that shadow shared types (lines 49-98)

#### Error Handling:
- ✅ **Good**: Returns empty array on failure (line 267) - graceful degradation
- ⚠️ **Inconsistent**: `loadFlashcardsMetadata()` returns `[]` on error (line 112) but `loadTestbankMetadata()` returns `null` (line 128)
- ⚠️ **Issue**: Silent failures could mask data problems

#### Data Validation:
- 🔴 **Critical**: No validation of loaded data
- 🔴 **Missing**: No check that `DOMAIN_CONFIG[group.meta.domain]` exists (line 166)
- ⚠️ **Risk**: If `group.meta.domain` is not in config, it's silently skipped (line 167)

#### Specific Code Issues:

```typescript
// Line 166-167: Unsafe access
const config = DOMAIN_CONFIG[group.meta.domain];
if (!config) continue; // Silently skips unknown domains
// Should log a warning for unknown domains

// Line 212: Unsafe mutation
existingTask.code = `${file.taskNumber}`; // Mutates without checking if task exists
// Already checked on line 209, but still risky pattern

// Line 350-351: Creates Date objects from strings
createdAt: new Date(),
updatedAt: new Date()
// These will always be the current time, not from data
```

---

### 4. formulasData.ts

**Location**: `packages/web-svelte/src/lib/utils/formulasData.ts`

#### Type Safety Issues:
- ✅ **Good**: Properly imports types from `@pmp/shared`
- ⚠️ **Inconsistent**: Has local `FormulasData` interface that duplicates imported types

#### Error Handling:
- ✅ **Good**: Consistent error handling throughout
- ⚠️ **Issue**: Generic error messages

#### Data Validation - 🔴 **CRITICAL ISSUES**:

```typescript
// Lines 143-456: calculateFormula function
export function calculateFormula(
  formula: Formula,
  inputs: Record<string, number>
): CalculationResult

// MAJOR ISSUES:
// 1. No validation that required inputs exist
// 2. No validation of input values (can be negative, Infinity, NaN)
// 3. Division by zero not checked (lines 173, 183, 225, 376)
// 4. No type checking on inputs object

// Example vulnerabilities:
case 'cpi':
  result = inputs.ev / inputs.ac;  // If inputs.ac = 0 → Infinity
  // No validation that inputs.ev or inputs.ac exist

case 'pv_fv':
  const pvResult = inputs.fv / Math.pow(1 + inputs.r, inputs.n);
  // If inputs.r = -1 → division by zero
  // If inputs.n is negative → unexpected behavior

case 'irr': {
  const cashFlows = inputs.cashFlows as unknown as number[];
  // Double type assertion - very unsafe
  // No validation that cashFlows is actually an array
```

#### Input Validation Issues:

```typescript
// Line 482: parseCashFlows - No validation
export function parseCashFlows(input: string): number[] {
  return input
    .split(',')
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));
  // No limit on array size (DoS risk)
  // No validation of numeric range
  // Empty strings become NaN and filtered out
}
```

---

## Cross-Cutting Concerns

### 1. Type System Inconsistency
**Severity**: 🔴 **HIGH**

**Problem**: Each file defines its own versions of types that exist in `@pmp/shared`:
- `flashcardsData.ts`: `Flashcard`, `FlashcardStats`
- `practiceData.ts`: `PracticeQuestion`, `DomainBreakdown`
- `studyData.ts`: Properly imports, but has local shadowing
- `formulasData.ts`: Mix of imported and local types

**Impact**:
- Type confusion when passing data between modules
- Maintenance burden (changes need to be made in multiple places)
- Potential for runtime type errors

**Recommendation**:
1. Audit which local types are truly different (raw vs. processed data)
2. Create separate types for raw JSON format if needed: `RawFlashcard`, `RawPracticeQuestion`
3. Use only shared types for application-internal data
4. Add transformation functions with validation: `rawToFlashcard(raw: RawFlashcard): Flashcard`

---

### 2. Missing Runtime Validation
**Severity**: 🔴 **HIGH**

**Problem**: All files use type assertions without runtime checks:
```typescript
const data = (await response.json()) as SomeType;
```

**Impact**:
- Malicious or malformed JSON could cause crashes
- Typos in JSON keys go undetected
- Missing required fields cause undefined errors

**Recommendation**:
Use Zod for runtime validation:
```typescript
import { z } from 'zod';

const FlashcardSchema = z.object({
  id: z.number(),
  category: z.string(),
  front: z.string(),
  back: z.string(),
});

const FlashcardGroupSchema = z.object({
  meta: z.object({
    title: z.string(),
    domain: z.string(),
    // ...
  }),
  flashcards: z.array(FlashcardSchema),
});

// Then use it:
const data = FlashcardGroupSchema.parse(await response.json());
```

---

### 3. Error Handling Inconsistency
**Severity**: ⚠️ **MEDIUM**

**Problem**: Three different error handling patterns:
1. Throw generic error (most common)
2. Return empty array (`studyData.ts` line 112)
3. Return null (`studyData.ts` line 128)

**Recommendation**:
Create consistent error handling utility:
```typescript
// lib/utils/dataLoadError.ts
export class DataLoadError extends Error {
  constructor(
    public resource: string,
    public cause: unknown
  ) {
    super(`Failed to load ${resource}`);
    this.name = 'DataLoadError';
  }
}

export async function loadWithErrorHandling<T>(
  resource: string,
  loader: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    console.error(`Failed to load ${resource}:`, error);
    if (fallback !== undefined) {
      return fallback;
    }
    throw new DataLoadError(resource, error);
  }
}
```

---

### 4. Input Validation in formulasData.ts
**Severity**: 🔴 **CRITICAL**

**Problem**: `calculateFormula()` performs calculations without validating inputs:
- Division by zero (lines 173, 183, 225, 376)
- Missing required inputs
- Invalid numeric values (Infinity, NaN)
- Unsafe type assertions for arrays

**Recommendation**:
```typescript
function validateInputs(
  inputs: Record<string, number>,
  required: string[]
): void {
  for (const key of required) {
    if (!(key in inputs)) {
      throw new Error(`Missing required input: ${key}`);
    }
    const value = inputs[key];
    if (!isFinite(value)) {
      throw new Error(`Invalid value for ${key}: ${value}`);
    }
  }
}

// Use in calculateFormula:
case 'cpi':
  validateInputs(inputs, ['ev', 'ac']);
  if (inputs.ac === 0) {
    throw new Error('AC cannot be zero');
  }
  result = inputs.ev / inputs.ac;
  break;
```

---

### 5. Security: XSS via JSON Content
**Severity**: ⚠️ **LOW**

**Problem**: Flashcard and question content is displayed without sanitization.

**Current Mitigation**: Svelte automatically escapes HTML in normal interpolations.

**Risk**: If any component uses `{@html}` directive without sanitization, malicious JSON could inject scripts.

**Recommendation**:
1. Audit for `{@html}` usage in components
2. Add CSP headers
3. Consider sanitizing content on load using DOMPurify

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Immediate)
1. ✅ Add input validation to `calculateFormula()` - prevent division by zero
2. ✅ Add Zod validation for all JSON parsing
3. ✅ Fix the unsafe random shuffle in `practiceData.ts`

### Phase 2: Type Consolidation (High Priority)
1. Create separate types for raw vs. processed data
2. Update all data loaders to use shared types
3. Add transformation functions with validation
4. Update all consumers to use canonical types

### Phase 3: Error Handling (Medium Priority)
1. Create consistent error handling utility
2. Add specific error types
3. Implement error boundaries in UI
4. Add error tracking/logging

### Phase 4: Hardening (Low Priority)
1. Add input sanitization
2. Add rate limiting for data loading
3. Add integrity checks (hash verification)
4. Add CSP headers

---

## Code Quality Metrics

| Metric | Score | Notes |
|--------|-------|-------|
| Type Safety | 6/10 | Duplicates, unsafe assertions |
| Error Handling | 7/10 | Consistent but generic |
| Data Validation | 3/10 | No runtime validation |
| Security | 7/10 | Low XSS risk, no sanitization |
| Maintainability | 6/10 | Duplicate type definitions |
| **Overall** | **5.8/10** | **Needs improvement** |

---

## Testing Recommendations

Current test coverage appears insufficient. Recommended tests:

### Unit Tests:
- Each loader function with valid JSON
- Each loader function with malformed JSON
- Each loader with network errors
- `calculateFormula()` with edge cases (division by zero, missing inputs)

### Integration Tests:
- Load data → Transform → Validate pipeline
- Error recovery scenarios
- Cache invalidation

### Property-Based Tests:
- Using `fast-check` or similar
- Validate that transformations preserve data
- Test round-trip serialization

---

## Conclusion

The data loaders are functional but have significant type safety and validation issues. The most critical concern is the `calculateFormula()` function which can produce incorrect results or crash with invalid inputs. The duplicate type definitions across files create maintenance burden and potential for bugs.

Implementing runtime validation with Zod and consolidating type definitions should be the top priorities. These changes will significantly improve reliability and maintainability.

---

**Issues Found**: 23 total (5 critical, 8 high, 7 medium, 3 low)
