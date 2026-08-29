import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './context/AuthContext';

test('renders the loading state while authentication is restored', () => {
  render(<AuthProvider><App /></AuthProvider>);
  expect(screen.getByText(/loading babycare360/i)).toBeInTheDocument();
});
