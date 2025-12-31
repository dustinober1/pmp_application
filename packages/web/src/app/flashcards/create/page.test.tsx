import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateFlashcardPage from './page';
import { vi } from 'vitest';
import { contentApi, flashcardApi } from '@/lib/api';

// Mocks
const { mockPush, mockUseAuth, mockGetDomains, mockGetTasks, mockCreateCustom } = vi.hoisted(() => {
    return {
        mockPush: vi.fn(),
        mockUseAuth: vi.fn(),
        mockGetDomains: vi.fn(),
        mockGetTasks: vi.fn(),
        mockCreateCustom: vi.fn(),
    };
});

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@/contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock('@/components/Navbar', () => ({
    Navbar: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('@/lib/api', () => ({
    contentApi: {
        getDomains: mockGetDomains,
        getTasks: mockGetTasks,
    },
    flashcardApi: {
        createCustom: mockCreateCustom,
    },
}));

describe('CreateFlashcardPage', () => {
    const mockDomains = [
        { id: 'd1', name: 'People' },
        { id: 'd2', name: 'Process' },
    ];
    const mockTasks = [
        { id: 't1', code: '1.1', name: 'Manage Conflict' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to login if unauthenticated', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
            user: null,
        });

        render(<CreateFlashcardPage />);
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('shows upgrade message for basic tier users', async () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            user: { tier: 'free' },
        });
        mockGetDomains.mockResolvedValue({ data: mockDomains });

        render(<CreateFlashcardPage />);

        await waitFor(() => {
            expect(screen.getByText(/upgrade required/i)).toBeInTheDocument();
        });

        // Form inputs should be disabled
        expect(screen.getByRole('button', { name: /create flashcard/i })).toBeDisabled();
    });

    it('allows pro users to create flashcards', async () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            user: { tier: 'high-end' },
        });
        mockGetDomains.mockResolvedValue({ data: mockDomains });
        mockGetTasks.mockResolvedValue({ data: mockTasks });
        mockCreateCustom.mockResolvedValue({ data: {} });

        render(<CreateFlashcardPage />);

        // Wait for domains to load
        await waitFor(() => {
            expect(screen.getByText('People')).toBeInTheDocument();
        });

        // Select domain
        fireEvent.change(screen.getByRole('combobox', { name: /domain/i }), { target: { value: 'd1' } });

        // Wait for tasks to load and select task
        await waitFor(() => {
            expect(mockGetTasks).toHaveBeenCalledWith('d1');
        });
        await waitFor(() => {
            expect(screen.getByText(/1.1 manage conflict/i)).toBeInTheDocument();
        });
        fireEvent.change(screen.getByRole('combobox', { name: /task/i }), { target: { value: 't1' } });

        // Fill content
        fireEvent.change(screen.getByLabelText(/front/i), { target: { value: 'Question?' } });
        fireEvent.change(screen.getByLabelText(/back/i), { target: { value: 'Answer!' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /create flashcard/i }));

        await waitFor(() => {
            expect(mockCreateCustom).toHaveBeenCalledWith({
                domainId: 'd1',
                taskId: 't1',
                front: 'Question?',
                back: 'Answer!',
            });
            expect(mockPush).toHaveBeenCalledWith('/flashcards');
        });
    });

    it('displays validation error if fields are missing', async () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            user: { tier: 'high-end' },
        });
        mockGetDomains.mockResolvedValue({ data: mockDomains });

        render(<CreateFlashcardPage />);
        await waitFor(() => expect(screen.getByText('People')).toBeInTheDocument());

        // Submit empty
        fireEvent.click(screen.getByRole('button', { name: /create flashcard/i }));

        await waitFor(() => {
            expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
        });
        expect(mockCreateCustom).not.toHaveBeenCalled();
    });
});
