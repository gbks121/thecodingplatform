import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from '../pages/LandingPage';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';

describe('LandingPage', () => {
    it('renders the title', () => {
        render(
            <BrowserRouter>
                <LandingPage />
            </BrowserRouter>
        );
        expect(screen.getByText(/The Coding Platform/i)).toBeInTheDocument();
    });

    it('has a join button', () => {
        render(
            <BrowserRouter>
                <LandingPage />
            </BrowserRouter>
        );
        expect(screen.getByRole('button', { name: /Join Session/i })).toBeInTheDocument();
    });
});
