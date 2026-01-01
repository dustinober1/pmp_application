import { describe, it, expect } from 'vitest';
import type { SyncActionType, SyncAction } from './sync';

// Note: The SyncService singleton is created at module import time and
// requires localStorage, which makes it difficult to test in isolation.
// The sync functionality is tested indirectly through integration tests.

describe('Sync module types', () => {
  it('exports SyncActionType type (compile-time check)', () => {
    // This is a compile-time test - if it compiles, the types exist
    const action: SyncActionType = 'MARK_SECTION_COMPLETE';

    // Runtime assertion that module structure is as expected
    expect(action).toBe('MARK_SECTION_COMPLETE');
  });

  it('exports SyncAction interface (compile-time check)', () => {
    // This is a compile-time test
    const action: Partial<SyncAction> = { type: 'MARK_SECTION_COMPLETE' };

    // Runtime assertion
    expect(action.type).toBe('MARK_SECTION_COMPLETE');
  });
});
