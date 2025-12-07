import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActiveUsersPanel } from '../components/ActiveUsersPanel';
import { useStore } from '../store';

// Mock store
vi.mock('../store', () => ({
    useStore: vi.fn(),
}));

describe('ActiveUsersPanel', () => {
    it('renders the list of active users', () => {
        (useStore as any).mockReturnValue({
            activeUsers: [
                { id: '1', name: 'Alice', color: '#ff0000' },
                { id: '2', name: 'Bob', color: '#00ff00' }
            ]
        });

        render(<ActiveUsersPanel />);

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText(/ACTIVE USERS \(2\)/i)).toBeInTheDocument();
    });

    it('shows empty state', () => {
        (useStore as any).mockReturnValue({
            activeUsers: []
        });

        render(<ActiveUsersPanel />);
        expect(screen.getByText(/ACTIVE USERS \(0\)/i)).toBeInTheDocument();
    });
});
