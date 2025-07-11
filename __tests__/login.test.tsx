import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginScreen from '../src/pages/Login';

describe('LoginScreen', () => {
  test('renders login form elements', () => {
    render(<LoginScreen />);

    const heading = screen.getByText(/login/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    expect(heading).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  test('shows error on invalid login', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(emailInput, { target: { value: '' } });
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.click(loginButton);

    const errorMessage = screen.getByText(/please enter valid credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('allows user to input email and password', () => {
    render(<LoginScreen />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });
});
