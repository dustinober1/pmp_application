/* eslint-disable @typescript-eslint/no-explicit-any -- SyncAction payloads vary by action type */
'use client';

import { apiRequest } from './api';

export type SyncActionType = 'MARK_SECTION_COMPLETE' | 'SUBMIT_FLASHCARD_RESULT';

export interface SyncAction {
  id: string;
  type: SyncActionType;
  payload: any;
  timestamp: number;
}

const STORAGE_KEY = 'pmp_offline_sync_queue';

function emit(event: string, detail?: unknown) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(event, { detail }));
}

class SyncService {
  private queue: SyncAction[] = [];
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadQueue();
      window.addEventListener('online', this.sync.bind(this));
    }
  }

  private loadQueue() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.queue = JSON.parse(stored);
    }
  }

  private saveQueue() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
  }

  /**
   * Queue an action to be performed when online
   */
  public async queueAction(type: SyncActionType, payload: any) {
    const action: SyncAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
    };

    this.queue.push(action);
    this.saveQueue();

    // Try to sync immediately if online
    if (navigator.onLine) {
      await this.sync();
    }
  }

  /**
   * Process the sync queue
   */
  public async sync() {
    if (this.isSyncing || this.queue.length === 0 || !navigator.onLine) return;

    this.isSyncing = true;
    let failureCount = 0;

    try {
      for (let index = 0; index < this.queue.length; ) {
        const action = this.queue[index];
        if (!action) break;

        try {
          await this.processAction(action);
          this.queue.splice(index, 1);
          this.saveQueue();
        } catch {
          failureCount += 1;
          index += 1;
        }
      }
    } finally {
      this.isSyncing = false;
      this.saveQueue();
    }

    if (failureCount > 0) emit('pmp-sync-failed', { count: failureCount });
  }

  private async processAction(action: SyncAction) {
    switch (action.type) {
      case 'MARK_SECTION_COMPLETE':
        await apiRequest(`/domains/progress/sections/${action.payload.sectionId}/complete`, {
          method: 'POST',
        });
        break;

      // Flashcard logic might be more complex if batched,
      // assuming single submission for now as per existng service
      case 'SUBMIT_FLASHCARD_RESULT':
        // Assuming payload has { flashcardId, quality }
        // The endpoint is likely /flashcards/:id/review or similar
        // We'll need to double check the exact endpoint in flashcard.service or routes
        // For now, mapping to a generic structure.
        // NOTE: The actual flashcard submission might need to be verified.
        // Checking flashcard.routes.ts... it is POST /:id/review
        await apiRequest(`/flashcards/${action.payload.flashcardId}/review`, {
          method: 'POST',
          body: { quality: action.payload.quality },
        });
        break;

      default:
        console.warn('Unknown action type', action.type);
    }
  }
}

export const syncService = new SyncService();
