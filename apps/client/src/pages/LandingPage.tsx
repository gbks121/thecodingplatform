import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Container,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Grid,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store";
import { v4 as uuidv4 } from "uuid";
import { Language } from "@thecodingplatform/shared";

// Icons
import CodeIcon from "@mui/icons-material/Code";
import GroupIcon from "@mui/icons-material/Group";
import ChatIcon from "@mui/icons-material/Chat";
import SpeedIcon from "@mui/icons-material/Speed";
import BoltIcon from "@mui/icons-material/Bolt";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ThemeToggle from "../components/ThemeToggle";

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { setUser, setSessionId, setLanguage } = useStore();
    const theme = useTheme();
    // const _isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [openCreate, setOpenCreate] = useState(false);
    const [openJoin, setOpenJoin] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [targetSessionId, setTargetSessionId] = useState("");
    const [selectedLanguage, setSelectedLanguage] =
        useState<Language>("javascript");

    // Check for ?join=xyz query param
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const joinId = params.get("join");
        if (joinId) {
            setTargetSessionId(joinId);
            setOpenJoin(true);
        }
    }, []);

    const handleCreate = () => {
        if (!name) return;
        // Generate short random ID (6 alphanumeric chars)
        const newSessionId = Math.random().toString(36).substring(2, 8);
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

        navigate(`/session/${targetSessionId}`);
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
                color: "text.primary",
                overflowX: "hidden",
                position: "relative",
            }}
        >
            {/* Ambient Background Effects */}
            <Box
                sx={{
                    position: "absolute",
                    top: "-20%",
                    left: "-10%",
                    width: "50%",
                    height: "50%",
                    background: (theme) =>
                        `radial-gradient(circle, ${theme.palette.mode === "dark" ? "rgba(144, 202, 249, 0.1)" : "rgba(103, 80, 164, 0.05)"} 0%, rgba(0,0,0,0) 70%)`,
                    filter: "blur(60px)",
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: "absolute",
                    bottom: "-10%",
                    right: "-5%",
                    width: "40%",
                    height: "40%",
                    background: (theme) =>
                        `radial-gradient(circle, ${theme.palette.mode === "dark" ? "rgba(208, 188, 255, 0.1)" : "rgba(208, 188, 255, 0.05)"} 0%, rgba(0,0,0,0) 70%)`,
                    filter: "blur(60px)",
                    zIndex: 0,
                }}
            />

            {/* Navbar */}
            <Container
                maxWidth="lg"
                sx={{ position: "relative", zIndex: 1, py: 3 }}
            >
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <AutoFixHighIcon sx={{ color: "primary.main" }} />
                        <Typography variant="h6" fontWeight="bold">
                            TheCodingPlatform
                        </Typography>
                    </Stack>
                    <ThemeToggle />
                </Stack>
            </Container>

            {/* Hero Section */}
            <Container
                maxWidth="md"
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    position: "relative",
                    zIndex: 1,
                    py: 8,
                }}
            >
                <Typography
                    variant="h1"
                    fontWeight="800"
                    sx={{
                        fontSize: { xs: "3rem", md: "5rem" },
                        background: (theme) =>
                            theme.palette.mode === "dark"
                                ? "linear-gradient(45deg, #fff 30%, #D0BCFF 90%)"
                                : "linear-gradient(45deg, #1D1B20 30%, #6750A4 90%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        mb: 2,
                        letterSpacing: "-0.02em",
                    }}
                >
                    Code Together,
                    <br /> Instantly.
                </Typography>

                <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{
                        mb: 6,
                        maxWidth: "600px",
                        mx: "auto",
                        lineHeight: 1.6,
                    }}
                >
                    Real-time collaborative code editor with instant execution,
                    multi-language support, and integrated chat. No setup
                    required.
                </Typography>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<BoltIcon />}
                        onClick={() => setOpenCreate(true)}
                        sx={{
                            px: 5,
                            py: 2,
                            fontSize: "1.2rem",
                            borderRadius: "50px",
                            background: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "linear-gradient(45deg, #6750A4 30%, #D0BCFF 90%)"
                                    : "linear-gradient(45deg, #6750A4 30%, #8576B5 90%)",
                            boxShadow: (theme) =>
                                `0 4px 20px ${theme.palette.mode === "dark" ? "rgba(103, 80, 164, 0.5)" : "rgba(103, 80, 164, 0.3)"}`,
                        }}
                    >
                        Start Coding Now
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<GroupIcon />}
                        onClick={() => setOpenJoin(true)}
                        sx={{
                            px: 5,
                            py: 2,
                            fontSize: "1.2rem",
                            borderRadius: "50px",
                            borderColor: "primary.main",
                            color: "text.primary",
                        }}
                    >
                        Join Session
                    </Button>
                </Stack>
            </Container>

            {/* Features Section */}
            <Box
                sx={{
                    bgcolor: "background.paper",
                    py: 10,
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <FeatureCard
                            icon={
                                <CodeIcon
                                    fontSize="large"
                                    sx={{ color: "#4DB6AC" }}
                                />
                            }
                            title="Multi-Language"
                            desc="Support for JavaScript, TypeScript, and Python with intelligent syntax highlighting."
                        />
                        <FeatureCard
                            icon={
                                <SpeedIcon
                                    fontSize="large"
                                    sx={{ color: "#FFB74D" }}
                                />
                            }
                            title="Instant Execution"
                            desc="Run your code safely in the browser powered by Pyodide and secure sandboxes."
                        />
                        <FeatureCard
                            icon={
                                <ChatIcon
                                    fontSize="large"
                                    sx={{ color: "#E57373" }}
                                />
                            }
                            title="Live Chat"
                            desc="Communicate with your team in real-time without leaving the editor."
                        />
                    </Grid>
                </Container>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    py: 4,
                    textAlign: "center",
                    color: "text.secondary",
                    fontSize: "0.9rem",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                TheCodingPlatform &copy; 2025. Built for speed and simplicity.
            </Box>

            {/* Create Dialog */}
            <Dialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        backgroundImage: "none",
                    },
                }}
            >
                <DialogTitle sx={{ color: "text.primary" }}>
                    Create New Session
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Name"
                        fullWidth
                        variant="filled"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Preferred Language</InputLabel>
                        <Select
                            value={selectedLanguage}
                            label="Preferred Language"
                            variant="filled"
                            onChange={(e) =>
                                setSelectedLanguage(e.target.value as Language)
                            }
                        >
                            <MenuItem value="javascript">JavaScript</MenuItem>
                            <MenuItem value="typescript">TypeScript</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenCreate(false)}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        sx={{ borderRadius: 20, px: 3 }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Join Dialog */}
            <Dialog
                open={openJoin}
                onClose={() => setOpenJoin(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        backgroundImage: "none",
                    },
                }}
            >
                <DialogTitle sx={{ color: "text.primary" }}>
                    Join Existing Session
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Name"
                        fullWidth
                        variant="filled"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Session ID"
                        fullWidth
                        variant="filled"
                        value={targetSessionId}
                        onChange={(e) => setTargetSessionId(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenJoin(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleJoin}
                        variant="contained"
                        sx={{ borderRadius: 20, px: 3 }}
                    >
                        Join
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    desc: string;
}> = ({ icon, title, desc }) => (
    <Grid item xs={12} md={4}>
        <Card
            elevation={0}
            sx={{
                height: "100%",
                bgcolor: "transparent",
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 4,
            }}
        >
            <CardContent sx={{ p: 4, textAlign: "left" }}>
                <Box sx={{ mb: 2 }}>{icon}</Box>
                <Typography
                    variant="h6"
                    fontWeight="bold"
                    gutterBottom
                    sx={{ color: "text.primary" }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.7 }}
                >
                    {desc}
                </Typography>
            </CardContent>
        </Card>
    </Grid>
);

export default LandingPage;
