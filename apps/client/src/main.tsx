import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#D0BCFF', // MD3 Purple 80
            light: '#EADDFF',
            dark: '#4F378B',
            contrastText: '#381E72',
        },
        secondary: {
            main: '#CCC2DC', // MD3 Secondary 80
            contrastText: '#332D41',
        },
        background: {
            default: '#141218', // MD3 Surface Container Low
            paper: '#1D1B20', // MD3 Surface Container
        },
        error: {
            main: '#F2B8B5',
            contrastText: '#601410',
        },
        text: {
            primary: '#E6E1E5',
            secondary: '#CDC2DB',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.02em' },
        h2: { fontSize: '2.25rem', fontWeight: 600, letterSpacing: '-0.01em' },
        h3: { fontSize: '1.75rem', fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
        fontFamilyCode: '"JetBrains Mono", monospace',
    } as any, // Extend typography type if needed
    shape: {
        borderRadius: 16, // MD3 uses larger rounded corners
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 20, // Pill shape
                    padding: '10px 24px',
                    boxShadow: 'none',
                    ':hover': {
                        boxShadow: '0px 1px 2px rgba(0,0,0,0.3)', // Subtle elevation
                    }
                },
                containedPrimary: {
                    color: '#381E72', // OnPrimary
                    backgroundColor: '#D0BCFF',
                }
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none', // Remove MD2 elevation overlay
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#141218',
                    backgroundImage: 'none',
                    boxShadow: 'none',
                    borderBottom: '1px solid #332D41',
                }
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: 'filled', // MD3 prefers filled text fields
            },
            styleOverrides: {
                root: {
                    '& .MuiFilledInput-root': {
                        borderRadius: '12px 12px 0 0',
                        backgroundColor: '#2B2930', // Surface Container High
                    }
                }
            }
        }
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>,
)
