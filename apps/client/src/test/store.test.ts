import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../store';

describe('Store', () => {
    beforeEach(() => {
        // Reset store state
        useStore.setState({
            user: null,
            language: 'javascript',
            logs: [],
            activeUsers: []
        });
    });

    it('should set user', () => {
        const { setUser } = useStore.getState();
        setUser({ id: '1', name: 'Alice', color: '#ff0000' });

        expect(useStore.getState().user).toEqual({
            id: '1',
            name: 'Alice',
            color: '#ff0000'
        });
    });

    it('should set language', () => {
        const { setLanguage } = useStore.getState();
        setLanguage('python');

        expect(useStore.getState().language).toBe('python');
    });

    it('should add log', () => {
        const { addLog } = useStore.getState();
        addLog({
            id: '1',
            type: 'stdout',
            message: 'Hello',
            timestamp: 1000
        });

        expect(useStore.getState().logs).toHaveLength(1);
        expect(useStore.getState().logs[0].message).toBe('Hello');
    });

    it('should clear logs', () => {
        const { addLog, clearLogs } = useStore.getState();
        addLog({
            id: '1',
            type: 'stdout',
            message: 'Test',
            timestamp: 1000
        });

        expect(useStore.getState().logs).toHaveLength(1);

        clearLogs();
        expect(useStore.getState().logs).toHaveLength(0);
    });

    it('should set active users', () => {
        const { setActiveUsers } = useStore.getState();
        const users = [
            { id: '1', name: 'Alice', color: '#ff0000' },
            { id: '2', name: 'Bob', color: '#00ff00' }
        ];

        setActiveUsers(users);
        expect(useStore.getState().activeUsers).toEqual(users);
    });
});
