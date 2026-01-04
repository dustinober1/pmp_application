/**
 * Svelte action for trapping focus within an element
 * Usage: <div use:focusTrap={initialFocusElement}>
 */

const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
  );
}

interface FocusTrapParameters {
  enabled?: boolean;
  initialFocus?: HTMLElement;
}

export function focusTrap(
  node: HTMLElement,
  parameters: FocusTrapParameters = {},
) {
  let { enabled = true, initialFocus } = parameters;
  let previouslyFocused: HTMLElement | null = null;

  const activate = () => {
    if (!enabled) return;

    previouslyFocused = document.activeElement as HTMLElement | null;

    const focusInitial = () => {
      if (initialFocus) {
        initialFocus.focus();
        return;
      }

      const focusable = getFocusableElements(node);
      focusable[0]?.focus();
    };

    focusInitial();
  };

  const deactivate = () => {
    previouslyFocused?.focus?.();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!enabled || event.key !== "Tab") return;

    const focusable = getFocusableElements(node);
    if (focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const current = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (!current || current === first || !node.contains(current)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  activate();

  document.addEventListener("keydown", onKeyDown);

  return {
    update(newParams: FocusTrapParameters) {
      enabled = newParams.enabled ?? true;
      initialFocus = newParams.initialFocus;

      if (enabled) {
        activate();
      } else {
        deactivate();
      }
    },
    destroy() {
      document.removeEventListener("keydown", onKeyDown);
      deactivate();
    },
  };
}
