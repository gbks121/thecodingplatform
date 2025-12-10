import React, { useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Select,
    MenuItem,
    CircularProgress,
    Tooltip,
    Stack,
    SelectChangeEvent,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ThemeToggle from "../components/ThemeToggle";
import type * as Monaco from "monaco-editor";

import { useStore } from "../store";
import { useYjs } from "../hooks/useYjs";
import { useCodeRunner } from "../hooks/useCodeRunner";
import { CodeEditor } from "../components/CodeEditor";
import { OutputPanel } from "../components/OutputPanel";
import { ActiveUsersPanel } from "../components/ActiveUsersPanel";
import { ChatPanel } from "../components/ChatPanel";
import { ConnectionIndicator } from "../components/ConnectionIndicator";
import { Language } from "@thecodingplatform/shared";
import * as Y from "yjs";

const CodingSession: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const { user, language, setSessionId, clearLogs } = useStore();
    const { provider, yDoc, isSynced, connectionStatus } = useYjs(
        sessionId || null,
        user
    );
    const { runCode, isRunning } = useCodeRunner();

    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<typeof Monaco | null>(null);
    const languageRef = useRef(language);

    // Keep languageRef updated
    useEffect(() => {
        languageRef.current = language;
    }, [language]);

    // Auth Guard: If no user, redirect to Landing Page with ?join param
    useEffect(() => {
        if (!user && sessionId) {
            navigate(`/?join=${sessionId}`);
        } else if (sessionId) {
            setSessionId(sessionId);
        }
    }, [user, sessionId, navigate, setSessionId]);

    const handleEditorMount = (
        editor: Monaco.editor.IStandaloneCodeEditor,
        monaco: typeof Monaco
    ) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
    };

    const handleRun = useCallback(async () => {
        if (!editorRef.current || !monacoRef.current) return;
        clearLogs();
        const code = editorRef.current.getValue();
        const currentLang = languageRef.current; // Use ref to get fresh value

        if (currentLang === "typescript") {
            // For TypeScript, we need to transpile it to JavaScript before execution
            // We'll use the TypeScript compiler that's already available in the project
            // Import dynamically to avoid bundling issues
            import("typescript")
                .then((tsModule) => {
                    const jsCode = tsModule.transpile(code, {
                        target: tsModule.ScriptTarget.ES2016,
                        module: tsModule.ModuleKind.ESNext,
                        allowJs: true,
                        lib: ["ES2016"],
                        removeComments: false,
                        noEmit: false,
                        inlineSourceMap: false,
                        inlineSources: true,
                    });
                    runCode(jsCode, "javascript");
                })
                .catch(() => {
                    // Fallback if TypeScript import fails
                    console.error(
                        "TypeScript transpilation failed, running as JavaScript"
                    );
                    runCode(code, "javascript");
                });
        } else {
            runCode(code, currentLang as "javascript" | "python");
        }
    }, [clearLogs, runCode]);

    // Listen for Shared State
    useEffect(() => {
        if (!yDoc || !isSynced) return;
        const metaMap = yDoc.getMap("meta");

        // Only set language if map is empty AND we are synced.
        if (!metaMap.has("language") && language) {
            metaMap.set("language", language);
        }

        const observer = (event: Y.YMapEvent<unknown>) => {
            if (event.keysChanged.has("run-trigger")) {
                handleRun();
            }
        };
        metaMap.observe(observer);
        return () => metaMap.unobserve(observer);
    }, [yDoc, isSynced, handleRun, language]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
    };

    const handleLanguageChange = useCallback(
        (e: SelectChangeEvent<Language>) => {
            const newLang = e.target.value as Language;
            if (yDoc) {
                yDoc.getMap("meta").set("language", newLang);
            }
        },
        [yDoc]
    );

    const broadcastRun = () => {
        if (yDoc) {
            yDoc.getMap("meta").set("run-trigger", Date.now());
        }
    };

    // Before user is confirmed, show nothing or loading (though effect redirects quickly)
    if (!user || !sessionId) return null;

    return (
        <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar variant="dense">
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => navigate("/")}
                        sx={{ mr: 2 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ flexGrow: 1 }}
                    >
                        <AutoFixHighIcon sx={{ color: "primary.main" }} />
                        <Typography variant="h6" fontWeight="bold" noWrap>
                            TheCodingPlatform
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                            sx={{ ml: 2 }}
                        >
                            Session: {sessionId}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={2} alignItems="center">
                        <Tooltip title="Copy Session Link">
                            <IconButton
                                color="inherit"
                                onClick={handleCopyLink}
                            >
                                <ContentCopyIcon />
                            </IconButton>
                        </Tooltip>

                        <ConnectionIndicator status={connectionStatus} />

                        <ThemeToggle />

                        <Select
                            value={language}
                            size="small"
                            onChange={handleLanguageChange}
                        >
                            <MenuItem value="javascript">JavaScript</MenuItem>
                            <MenuItem value="typescript">TypeScript</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                        </Select>

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={
                                isRunning ? (
                                    <CircularProgress
                                        size={20}
                                        color="inherit"
                                    />
                                ) : (
                                    <PlayArrowIcon />
                                )
                            }
                            onClick={broadcastRun}
                            disabled={isRunning}
                        >
                            Run
                        </Button>
                    </Stack>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
                {/* Left: Editor + Output */}
                <Box
                    sx={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        minWidth: 0,
                    }}
                >
                    <Box
                        sx={{
                            flex: 2,
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                        }}
                    >
                        <CodeEditor
                            yDoc={yDoc}
                            provider={provider}
                            onEditorMount={handleEditorMount}
                        />
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: "200px",
                            borderTop: (theme) =>
                                `4px solid ${theme.palette.divider}`,
                            bgcolor: "background.paper",
                        }}
                    >
                        <OutputPanel />
                    </Box>
                </Box>

                {/* Right: Active Users & Chat */}
                <Box
                    sx={{
                        width: 300,
                        display: { xs: "none", md: "flex" },
                        flexDirection: "column",
                        borderLeft: 1,
                        borderColor: "divider",
                    }}
                >
                    <Box sx={{ flexShrink: 0 }}>
                        <ActiveUsersPanel />
                    </Box>
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <ChatPanel yDoc={yDoc} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CodingSession;
