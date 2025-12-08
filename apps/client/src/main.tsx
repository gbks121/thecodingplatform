import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ThemeManager from "./components/ThemeManager";

// --- App Entry ---

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeManager>
            <App />
        </ThemeManager>
    </React.StrictMode>
);
