// This is the custom App component, where global styles and other global settings are applied.
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@/contexts/ThemeContext';

function MyApp({ Component, pageProps }: AppProps) {
  // Renders the current page, passing in any props that were fetched during SSR or SSG.
  return (
    <ThemeProvider>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
