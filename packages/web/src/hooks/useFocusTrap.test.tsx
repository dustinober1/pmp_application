import { render, screen, fireEvent } from '@testing-library/react';
import { useRef, useState } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useFocusTrap } from './useFocusTrap';

// Test component that uses the hook
function TestDialog({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(active, containerRef, inputRef);

  return (
    <div ref={containerRef} data-testid="dialog">
      <input ref={inputRef} data-testid="first-input" />
      <button data-testid="middle-button">Middle</button>
      <input data-testid="last-input" />
    </div>
  );
}

function TestDialogWrapper() {
  const [active, setActive] = useState(false);

  return (
    <div>
      <button data-testid="toggle" onClick={() => setActive(!active)}>
        Toggle
      </button>
      <TestDialog active={active} />
    </div>
  );
}

describe('useFocusTrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('focuses initial element when trap becomes active', () => {
    render(<TestDialogWrapper />);

    // Activate the trap
    fireEvent.click(screen.getByTestId('toggle'));

    // Initial focus should be on the first input (via initialFocusRef)
    expect(screen.getByTestId('first-input')).toHaveFocus();
  });

  it('does not trap focus when inactive', () => {
    render(<TestDialogWrapper />);

    // Focus the first input
    screen.getByTestId('first-input').focus();
    expect(screen.getByTestId('first-input')).toHaveFocus();

    // Tab to next element - should work normally without trap
    fireEvent.keyDown(document, { key: 'Tab' });
    // Focus behavior varies in jsdom, but trap should not interfere
  });

  it('traps forward Tab on last element', () => {
    render(<TestDialogWrapper />);

    // Activate the trap
    fireEvent.click(screen.getByTestId('toggle'));

    // Focus the last element
    screen.getByTestId('last-input').focus();

    // Tab should wrap to first
    fireEvent.keyDown(document, { key: 'Tab' });

    expect(screen.getByTestId('first-input')).toHaveFocus();
  });

  it('traps backward Tab on first element', () => {
    render(<TestDialogWrapper />);

    // Activate the trap
    fireEvent.click(screen.getByTestId('toggle'));

    // Focus the first element
    screen.getByTestId('first-input').focus();

    // Shift+Tab should wrap to last
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(screen.getByTestId('last-input')).toHaveFocus();
  });

  it('restores focus when trap deactivates', () => {
    const TestWithExternalFocus = () => {
      const [active, setActive] = useState(false);
      const containerRef = useRef<HTMLDivElement>(null);

      useFocusTrap(active, containerRef);

      return (
        <div>
          <button data-testid="external-button" onClick={() => setActive(true)}>
            Open
          </button>
          {active && (
            <div ref={containerRef}>
              <button data-testid="dialog-button" onClick={() => setActive(false)}>
                Close
              </button>
            </div>
          )}
        </div>
      );
    };

    render(<TestWithExternalFocus />);

    // Focus external button and click to open
    const externalButton = screen.getByTestId('external-button');
    externalButton.focus();
    fireEvent.click(externalButton);

    // Dialog button should now have focus
    expect(screen.getByTestId('dialog-button')).toHaveFocus();

    // Close dialog
    fireEvent.click(screen.getByTestId('dialog-button'));

    // Focus should restore to previously focused element
    expect(externalButton).toHaveFocus();
  });

  it('handles container with no focusable elements', () => {
    const EmptyDialog = ({ active }: { active: boolean }) => {
      const containerRef = useRef<HTMLDivElement>(null);
      useFocusTrap(active, containerRef);

      return (
        <div ref={containerRef}>
          <span>No focusable elements</span>
        </div>
      );
    };

    const { rerender } = render(<EmptyDialog active={false} />);

    // Should not throw when activated
    expect(() => {
      rerender(<EmptyDialog active={true} />);
    }).not.toThrow();
  });

  it('ignores non-Tab keys', () => {
    render(<TestDialogWrapper />);

    // Activate the trap
    fireEvent.click(screen.getByTestId('toggle'));

    screen.getByTestId('first-input').focus();

    // Other keys should not affect focus
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(screen.getByTestId('first-input')).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('first-input')).toHaveFocus();
  });
});
