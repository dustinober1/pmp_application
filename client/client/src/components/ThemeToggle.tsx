import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="
                relative inline-flex items-center justify-center
                w-10 h-10 rounded-lg
                bg-gray-100 dark:bg-gray-800
                hover:bg-gray-200 dark:hover:bg-gray-700
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            aria-label="Toggle dark mode"
        >
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400 hidden dark:block" />
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400 block dark:hidden" />
            <span className="sr-only">
                {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
        </button>
    );
}
