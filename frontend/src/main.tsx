import React from 'react'; import ReactDOM from 'react-dom/client'; import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'; import App from './App'; import './styles.css';
const theme = createTheme({ palette: { mode: 'light', primary: { main: '#2449a6' }, background: { default: '#f5f7fb' } }, shape: { borderRadius: 12 }, typography: { fontFamily: 'Inter, system-ui, sans-serif' } });
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ThemeProvider theme={theme}><CssBaseline/><App/></ThemeProvider></React.StrictMode>);
