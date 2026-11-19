import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
describe('App shell', () => {
  it('renders salary management heading', () => {
    render(<ThemeProvider theme={createTheme()}><App/></ThemeProvider>);
    expect(screen.getByText('Salary overview')).toBeInTheDocument();
  });
});
