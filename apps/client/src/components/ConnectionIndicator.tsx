import React from 'react';
import { Box, Tooltip } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

interface ConnectionIndicatorProps {
    status: ConnectionStatus;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({ status }) => {
    const getColor = () => {
        switch (status) {
            case 'connected':
                return '#4caf50'; // Green
            case 'connecting':
                return '#ff9800'; // Amber
            case 'disconnected':
                return '#f44336'; // Red
            default:
                return '#9e9e9e'; // Gray
        }
    };

    const getTooltip = () => {
        switch (status) {
            case 'connected':
                return 'Connected to server';
            case 'connecting':
                return 'Connecting to server...';
            case 'disconnected':
                return 'Disconnected from server';
            default:
                return 'Unknown status';
        }
    };

    return (
        <Tooltip title={getTooltip()} arrow>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'help',
                }}
            >
                <FiberManualRecordIcon
                    sx={{
                        fontSize: 16,
                        color: getColor(),
                        animation: status === 'connecting' ? 'pulse 1.5s ease-in-out infinite' : 'none',
                        '@keyframes pulse': {
                            '0%, 100%': {
                                opacity: 1,
                            },
                            '50%': {
                                opacity: 0.4,
                            },
                        },
                    }}
                />
            </Box>
        </Tooltip>
    );
};
