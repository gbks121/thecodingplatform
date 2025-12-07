import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useStore } from '../store';

export const OutputPanel: React.FC = () => {
    const { logs } = useStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <Paper
            variant="outlined"
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#1e1e1e',
                borderColor: '#333'
            }}
        >
            <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: '#333' }}>
                <Typography variant="caption" sx={{ color: '#aaa', fontWeight: 'bold' }}>
                    TERMINAL / OUTPUT
                </Typography>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                {logs.map((log) => (
                    <Box key={log.id} sx={{ mb: 0.5, display: 'flex' }}>
                        <Box
                            component="span"
                            sx={{
                                color: log.type === 'stderr' ? '#f44336' : log.type === 'system' ? '#2196f3' : '#e0e0e0',
                                mr: 1
                            }}
                        >
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                        </Box>
                        <Box component="span" sx={{ color: log.type === 'stderr' ? '#ffcdd2' : '#fff' }}>
                            {log.message}
                        </Box>
                    </Box>
                ))}
                <div ref={bottomRef} />
            </Box>
        </Paper>
    );
};
