import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper, Button, Stack } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useStore } from "../store";

export const OutputPanel: React.FC = () => {
    const { logs, clearLogs } = useStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <Paper
            variant="outlined"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
                borderColor: "divider",
            }}
        >
            <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography
                        variant="caption"
                        sx={{ color: "text.secondary", fontWeight: "bold" }}
                    >
                        TERMINAL / OUTPUT
                    </Typography>
                    <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        startIcon={<ClearIcon />}
                        onClick={clearLogs}
                        disabled={logs.length === 0}
                    >
                        Clear
                    </Button>
                </Stack>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    overflow: "auto",
                    p: 1,
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                }}
            >
                {logs.map((log) => (
                    <Box key={log.id} sx={{ mb: 0.5, display: "flex" }}>
                        <Box
                            component="span"
                            sx={{
                                color:
                                    log.type === "stderr"
                                        ? "#f44336"
                                        : log.type === "system"
                                          ? "#2196f3"
                                          : "text.secondary",
                                mr: 1,
                            }}
                        >
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                        </Box>
                        <Box
                            component="span"
                            sx={{
                                color:
                                    log.type === "stderr"
                                        ? "#ffcdd2"
                                        : "text.primary",
                            }}
                        >
                            {log.message}
                        </Box>
                    </Box>
                ))}
                <div ref={bottomRef} />
            </Box>
        </Paper>
    );
};
