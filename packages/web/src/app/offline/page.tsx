'use client';

import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl font-bold text-white mb-4">You are Offline</h1>
      <p className="text-gray-400 mb-8 max-w-md">
        It seems you’ve lost your internet connection. Don’t worry, you can still access content
        you’ve previously visited.
      </p>

      <div className="grid gap-4 w-full max-w-sm">
        <Link
          href="/study"
          className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 transition text-left"
        >
          <span className="block font-semibold">
            <span aria-hidden="true">📚</span> Study Guides
          </span>
          <span className="text-sm text-gray-500">Access previously opened guides</span>
        </Link>
        <Link
          href="/flashcards"
          className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 transition text-left"
        >
          <span className="block font-semibold">
            <span aria-hidden="true">🗂️</span> Flashcards
          </span>
          <span className="text-sm text-gray-500">Review cached cards</span>
        </Link>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-2 bg-[var(--primary)] text-white rounded-full hover:opacity-90 transition"
      >
        Try Reconnecting
      </button>
    </div>
  );
}
