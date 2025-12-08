import React from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Divider,
} from "@mui/material";
import { useStore } from "../store";

export const ActiveUsersPanel: React.FC = () => {
    const { activeUsers } = useStore();
    const [now, setNow] = React.useState(() => Date.now());

    // Re-render every 500ms to update "typing" status
    React.useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <Box
            sx={{
                height: "100%",
                overflow: "auto",
                bgcolor: "background.paper",
                borderLeft: 1,
                borderColor: "divider",
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    ACTIVE USERS ({activeUsers.length})
                </Typography>
            </Box>
            <Divider />
            <List dense>
                {activeUsers.map((user) => {
                    const isTyping =
                        user.lastActivity && now - user.lastActivity < 1500;
                    return (
                        <ListItem key={user.id}>
                            <ListItemAvatar>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: user.color || "primary.main",
                                    }}
                                >
                                    {user.name.charAt(0).toUpperCase()}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={user.name}
                                secondary={
                                    isTyping ? (
                                        <Box
                                            component="span"
                                            sx={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                color: "success.main",
                                                fontSize: "0.75rem",
                                            }}
                                        >
                                            Typing...
                                        </Box>
                                    ) : null
                                }
                            />
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );
};
