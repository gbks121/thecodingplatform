import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CodingSession from "./pages/CodingSession";

function App() {
    return (
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}
        >
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/session/:sessionId" element={<CodingSession />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
