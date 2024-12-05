// This is the custom App component, where global styles and other global settings are applied.
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { rootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/contexts/StoreContext';

function MyApp({ Component, pageProps }: AppProps) {
  // Renders the current page, passing in any props that were fetched during SSR or SSG.
  return (
    <StoreContext.Provider value={rootStore}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </StoreContext.Provider>
  );
}

export default observer(MyApp);
