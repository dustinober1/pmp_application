"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { SearchResult } from "@pmp/shared";
import { useToast } from "@/components/ToastProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { apiRequest } from "../lib/api";

interface SearchDialogProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SearchDialogComponent = ({ open, setOpen }: SearchDialogProps) => {
  const pathname = usePathname();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastPathRef = useRef(pathname);

  useFocusTrap(open, dialogRef, inputRef);

  const handleClose = useCallback(() => setOpen(false), [setOpen]);

  // Debounced search
  useEffect(() => {
    if (!open) {
      setResults([]);
      setLoading(false);
      return;
    }

    let isActive = true;
    const timer = setTimeout(async () => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length < 2) {
        if (isActive) {
          setResults([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const response = await apiRequest<{ results: SearchResult[] }>(
          `/search?q=${encodeURIComponent(trimmedQuery)}&limit=10`,
        );
        if (response.data && isActive) {
          setResults(response.data.results);
        }
      } catch (error) {
        if (isActive) {
          console.error("Search failed", error);
          toast.error("Search failed. Please try again.");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [open, query, toast]);

  // Global keyboard shortcut
  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [handleClose]);

  // Close on navigation
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    setOpen(false);
    setQuery("");
  }, [pathname, setOpen]);

  if (!open) return null;

  return (
    <div
      className="relative z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        aria-label="Close search"
      ></button>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto p-4 sm:p-6 md:p-20">
        <div
          ref={dialogRef}
          className="mx-auto max-w-2xl transform divide-y divide-gray-800 rounded-xl bg-gray-900 border border-gray-700 shadow-2xl transition-all"
        >
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <svg
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-white placeholder:text-gray-400 focus:ring-0 sm:text-sm"
              placeholder="Search study guides, flashcards, questions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search"
            />
          </div>

          {verifyResults(results, loading, query)}
        </div>
      </div>
    </div>
  );
}

function verifyResults(
  results: SearchResult[],
  loading: boolean,
  query: string,
) {
  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
    );
  }

  if (results.length === 0 && query.trim().length >= 2) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        {`No results found for "${query}"`}
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <ul className="max-h-96 scroll-py-2 overflow-y-auto py-2 text-sm text-gray-200">
        {results.map((result) => (
          <li key={`${result.type}-${result.id}`}>
            <Link
              href={getResultLink(result)}
              className="group flex select-none items-center px-4 py-2 hover:bg-gray-800 hover:text-white"
            >
              <span className="flex-none text-xl mr-3" aria-hidden="true">
                {getResultIcon(result.type)}
              </span>
              <div className="flex-auto truncate">
                <p className="truncate font-medium">{result.title}</p>
                <p className="truncate text-xs text-gray-500">
                  {result.excerpt}
                </p>
              </div>
              <span className="ml-3 flex-none text-xs font-medium text-gray-500 capitalize">
                {result.type.replace("_", " ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  // Default state
  return (
    <div className="py-14 px-6 text-center text-sm sm:px-14">
      <p className="mt-4 text-gray-400">
        Press{" "}
        <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border border-gray-700 bg-gray-800 font-semibold text-white sm:mx-2">
          ↵
        </kbd>{" "}
        to select,{" "}
        <kbd className="mx-1 flex h-5 w-5 items-center justify-center rounded border border-gray-700 bg-gray-800 font-semibold text-white sm:mx-2">
          Esc
        </kbd>{" "}
        to close
      </p>
    </div>
  );
}

function getResultIcon(type: SearchResult["type"]) {
  switch (type) {
    case "study_guide":
      return "📚";
    case "flashcard":
      return "🗂️";
    case "question":
      return "❓";
    case "formula":
      return "∑";
    default:
      return "📄";
  }
}

function getResultLink(result: SearchResult) {
  switch (result.type) {
    case "study_guide":
      // If it's a section, we might want to link to the section
      return `/study/${result.taskId}`;
    case "flashcard":
      return `/flashcards`; // Ideally filter by task
    case "question":
      return `/practice`;
    case "formula":
      return `/formulas`;
    default:
      return `/dashboard`;
  }
}

export default memo(SearchDialogComponent);
