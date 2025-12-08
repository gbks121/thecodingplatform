import React from 'react';
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import CheckIcon from '@mui/icons-material/Check';
import { useStore } from '../store';

type ThemeMode = 'light' | 'dark' | 'system';

const ThemeToggle: React.FC = () => {
    const { themeMode, setThemeMode } = useStore();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (mode: ThemeMode) => {
        setThemeMode(mode);
        handleClose();
    };

    const getCurrentIcon = () => {
        switch (themeMode) {
            case 'light':
                return <LightModeIcon />;
            case 'dark':
                return <DarkModeIcon />;
            default:
                return <SettingsBrightnessIcon />;
        }
    };

    const getTooltipText = () => {
        switch (themeMode) {
            case 'light':
                return 'Light mode';
            case 'dark':
                return 'Dark mode';
            default:
                return 'System theme';
        }
    };

    const options: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
        { mode: 'light', icon: <LightModeIcon fontSize="small" />, label: 'Light' },
        { mode: 'dark', icon: <DarkModeIcon fontSize="small" />, label: 'Dark' },
        { mode: 'system', icon: <SettingsBrightnessIcon fontSize="small" />, label: 'System' },
    ];

    return (
        <>
            <Tooltip title={getTooltipText()} arrow>
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            color: 'primary.main',
                            transform: 'rotate(15deg)',
                        },
                    }}
                    aria-label="Toggle theme"
                    aria-controls={open ? 'theme-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    {getCurrentIcon()}
                </IconButton>
            </Tooltip>
            <Menu
                id="theme-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'theme-button',
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    sx: {
                        mt: 1,
                        minWidth: 140,
                        borderRadius: 2,
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.mode}
                        onClick={() => handleSelect(option.mode)}
                        selected={themeMode === option.mode}
                        sx={{
                            borderRadius: 1,
                            mx: 0.5,
                            my: 0.25,
                        }}
                    >
                        <ListItemIcon>{option.icon}</ListItemIcon>
                        <ListItemText>{option.label}</ListItemText>
                        {themeMode === option.mode && (
                            <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />
                        )}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default ThemeToggle;
