import React, { useState } from 'react';
import {
    Box, Button, Container, Typography, Dialog, DialogTitle,
    DialogContent, TextField, DialogActions, FormControl,
    InputLabel, Select, MenuItem, Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { Language } from '@thecodingplatform/shared';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { setUser, setSessionId, setLanguage } = useStore();

    const [openCreate, setOpenCreate] = useState(false);
    const [openJoin, setOpenJoin] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [targetSessionId, setTargetSessionId] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');

    const handleCreate = () => {
        if (!name) return;
        const newSessionId = uuidv4();
        const userId = uuidv4();

        setUser({ id: userId, name });
        setSessionId(newSessionId);
        setLanguage(selectedLanguage);

        navigate(`/session/${newSessionId}`);
    };

    const handleJoin = () => {
        if (!name || !targetSessionId) return;
        const userId = uuidv4();

        setUser({ id: userId, name });
        setSessionId(targetSessionId);
        // Language will be synced from session state usually, or default

        navigate(`/session/${targetSessionId}`);
    };

    return (
        <Box sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(45deg, #1e1e1e 30%, #252526 90%)',
        }}>
            <Container maxWidth="md" sx={{ textAlign: 'center' }}>
                <Typography variant="h2" component="h1" gutterBottom fontWeight="bold" sx={{ color: '#fff' }}>
                    The Coding Platform
                </Typography>
                <Typography variant="h5" color="text.secondary" gutterBottom sx={{ mb: 6 }}>
                    Real-time collaborative coding interviews and practice.
                </Typography>

                <Stack direction="row" spacing={4} justifyContent="center">
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => setOpenCreate(true)}
                        sx={{ px: 5, py: 1.5, fontSize: '1.2rem' }}
                    >
                        Create Session
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => setOpenJoin(true)}
                        sx={{ px: 5, py: 1.5, fontSize: '1.2rem' }}
                    >
                        Join Session
                    </Button>
                </Stack>
            </Container>


            {/* Create Dialog */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="xs">
                <DialogTitle>Create New Session</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Name"
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <FormControl fullWidth margin="dense" sx={{ mt: 2 }}>
                        <InputLabel>Preferred Language</InputLabel>
                        <Select
                            value={selectedLanguage}
                            label="Preferred Language"
                            onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                        >
                            <MenuItem value="javascript">JavaScript</MenuItem>
                            <MenuItem value="typescript">TypeScript</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained">Create</Button>
                </DialogActions>
            </Dialog>

            {/* Join Dialog */}
            <Dialog open={openJoin} onClose={() => setOpenJoin(false)} fullWidth maxWidth="xs">
                <DialogTitle>Join Existing Session</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Name"
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Session ID"
                        fullWidth
                        variant="outlined"
                        value={targetSessionId}
                        onChange={(e) => setTargetSessionId(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenJoin(false)}>Cancel</Button>
                    <Button onClick={handleJoin} variant="contained">Join</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LandingPage;
