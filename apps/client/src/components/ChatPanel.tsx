import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Paper, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import * as Y from 'yjs';
import { useStore } from '../store';
import { ChatMessage } from '@thecodingplatform/shared';

interface ChatPanelProps {
    yDoc: Y.Doc | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ yDoc }) => {
    const { user } = useStore();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!yDoc) return;
        const chatArray = yDoc.getArray<ChatMessage>('chat');

        const updateMessages = () => {
            setMessages(chatArray.toArray());
            // Scroll to bottom on new message
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        };

        // Initial load
        updateMessages();

        chatArray.observe(updateMessages);
        return () => chatArray.unobserve(updateMessages);
    }, [yDoc]);

    const handleSend = () => {
        if (!input.trim() || !yDoc || !user) return;

        const chatArray = yDoc.getArray<ChatMessage>('chat');
        const newMessage: ChatMessage = {
            id: Math.random().toString(36).substring(2, 9),
            userId: user.id,
            userName: user.name,
            text: input.trim(),
            timestamp: Date.now()
        };

        chatArray.push([newMessage]);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Paper elevation={0} sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            color: 'text.primary',
            minHeight: 0 // Allow flex shrink
        }}>
            <Box sx={{ p: 1, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" fontWeight="bold">Chat</Typography>
            </Box>

            <Box sx={{ flex: 1, overflowY: 'auto', p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {messages.map((msg) => {
                    const isMe = msg.userId === user?.id;
                    return (
                        <Box
                            key={msg.id}
                            sx={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                            }}
                        >
                            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontSize: '0.7rem' }}>
                                {isMe ? 'You' : msg.userName}
                            </Typography>
                            <Paper sx={{
                                p: 1,
                                px: 1.5,
                                bgcolor: isMe ? 'primary.main' : (theme) => theme.palette.mode === 'dark' ? '#333' : '#e0e0e0',
                                color: isMe ? 'primary.contrastText' : 'text.primary',
                                borderRadius: 2
                            }}>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                    {msg.text}
                                </Typography>
                            </Paper>
                        </Box>
                    );
                })}
                <div ref={bottomRef} />
            </Box>

            <Divider />

            <Box sx={{ p: 1, display: 'flex', gap: 1 }}>
                <TextField
                    size="small"
                    placeholder="Type a message..."
                    fullWidth
                    variant="outlined"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    sx={{
                        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2d2d2d' : 'background.default',
                        '& .MuiOutlinedInput-root': {
                            color: 'text.primary',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                        }
                    }}
                />
                <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
};
