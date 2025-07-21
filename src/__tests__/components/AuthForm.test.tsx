import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '@/app/components/AuthForm';
import { signIn, signUp } from '@/lib/auth-client';

// Mock the auth-client module
jest.mock('@/lib/auth-client', () => require('../../__tests__/__mocks__/auth-client'));

// Mock console methods to reduce test noise
beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
});

afterEach(() => {
    jest.clearAllMocks();
});

// --- Flexible field getter (label OR placeholder OR accessible name) ---
const getInput = (label: RegExp, placeholder: RegExp) => {
    return (
        screen.queryByLabelText(label) ??
        screen.queryByPlaceholderText(placeholder) ??
        screen.getByRole('textbox', { name: label })
    );
};

describe('AuthForm Component', () => {
    describe('Login Mode', () => {
        beforeEach(() => {
            render(<AuthForm mode="login" />);
        });

        it('renders the login form correctly', () => {
            expect(getInput(/email/i, /email/i)).toBeInTheDocument();
            expect(getInput(/password/i, /password/i)).toBeInTheDocument();

            expect(screen.getByText(/sign in/i)).toBeInTheDocument();
            expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
            expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();

            expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
        });

        it('submits the login form with valid credentials', async () => {
            const user = userEvent.setup();

            await user.type(getInput(/email/i, /email/i), 'test@example.com');
            await user.type(getInput(/password/i, /password/i), 'password123');

            await user.click(screen.getByRole('button', { name: /sign in/i }));

            await waitFor(() => {
                expect(signIn.email).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'password123',
                    callbackURL: expect.any(String)
                });
            });
        });

        it('handles Google sign in button click', async () => {
            const user = userEvent.setup();

            await user.click(screen.getByRole('button', { name: /continue with google/i }));

            await waitFor(() => {
                expect(signIn.social).toHaveBeenCalledWith({
                    provider: 'google',
                    callbackURL: expect.any(String)
                });
            });
        });
    });

    describe('Signup Mode', () => {
        beforeEach(() => {
            render(<AuthForm mode="signup" />);
        });

        it('renders the signup form correctly', () => {
            expect(getInput(/name/i, /name/i)).toBeInTheDocument();
            expect(getInput(/email/i, /email/i)).toBeInTheDocument();
            expect(getInput(/^password$/i, /password/i)).toBeInTheDocument();
            expect(getInput(/confirm password/i, /confirm password/i)).toBeInTheDocument();

            expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
            expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
        });

        it('validates passwords match before submission', async () => {
            const user = userEvent.setup();

            await user.type(getInput(/name/i, /name/i), 'Test User');
            await user.type(getInput(/email/i, /email/i), 'test@example.com');
            await user.type(getInput(/^password$/i, /password/i), 'password123');
            await user.type(getInput(/confirm password/i, /confirm password/i), 'different123');

            await user.click(screen.getByRole('button', { name: /sign up/i }));

            expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
            expect(signUp.email).not.toHaveBeenCalled();
        });

        it('submits the signup form with valid data', async () => {
            const user = userEvent.setup();

            await user.type(getInput(/name/i, /name/i), 'Test User');
            await user.type(getInput(/email/i, /email/i), 'test@example.com');
            await user.type(getInput(/^password$/i, /password/i), 'password123');
            await user.type(getInput(/confirm password/i, /confirm password/i), 'password123');

            await user.click(screen.getByRole('button', { name: /sign up/i }));

            await waitFor(() => {
                expect(signUp.email).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User'
                });
            });
        });

        it('shows verification sent screen after successful signup', async () => {
            const user = userEvent.setup();

            await user.type(getInput(/name/i, /name/i), 'Test User');
            await user.type(getInput(/email/i, /email/i), 'test@example.com');
            await user.type(getInput(/^password$/i, /password/i), 'password123');
            await user.type(getInput(/confirm password/i, /confirm password/i), 'password123');

            await user.click(screen.getByRole('button', { name: /sign up/i }));

            expect(await screen.findByText(/verification email sent/i)).toBeInTheDocument();
            expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('displays error message when login fails', async () => {
            (signIn.email as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

            render(<AuthForm mode="login" />);
            const user = userEvent.setup();

            await user.type(getInput(/email/i, /email/i), 'test@example.com');
            await user.type(getInput(/password/i, /password/i), 'password123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
        });

        it('displays error message when signup fails', async () => {
            (signUp.email as jest.Mock).mockRejectedValueOnce(new Error('Email already exists'));

            render(<AuthForm mode="signup" />);
            const user = userEvent.setup();

            await user.type(getInput(/name/i, /name/i), 'Test User');
            await user.type(getInput(/email/i, /email/i), 'test@example.com');
            await user.type(getInput(/^password$/i, /password/i), 'password123');
            await user.type(getInput(/confirm password/i, /confirm password/i), 'password123');

            await user.click(screen.getByRole('button', { name: /sign up/i }));

            expect(await screen.findByText(/already registered|email already exists|already taken/i)).toBeInTheDocument();
        });
    });
});
