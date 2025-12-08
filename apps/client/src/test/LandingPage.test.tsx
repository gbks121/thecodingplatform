import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "../pages/LandingPage";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";

const theme = createTheme({ palette: { mode: "dark" } });

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ThemeProvider theme={theme}>
        <BrowserRouter>{children}</BrowserRouter>
    </ThemeProvider>
);

describe("LandingPage", () => {
    it("renders the hero section with Start Coding button", () => {
        render(<LandingPage />, { wrapper: Wrapper });
        expect(
            screen.getByRole("button", { name: /Start Coding Now/i })
        ).toBeInTheDocument();
    });

    it("has a join session button", () => {
        render(<LandingPage />, { wrapper: Wrapper });
        expect(
            screen.getByRole("button", { name: /Join Session/i })
        ).toBeInTheDocument();
    });
});
