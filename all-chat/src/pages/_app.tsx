// This is the custom App component, where global styles and other global settings are applied.
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { rootStore } from '@/stores/RootStore';
import { observer } from 'mobx-react-lite';
import { StoreContext } from '@/contexts/StoreContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
  // Renders the current page, passing in any props that were fetched during SSR or SSG.
  return (
    <StoreContext.Provider value={rootStore}>
      <ThemeProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        </Head>
        <Component {...pageProps} />
      </ThemeProvider>
    </StoreContext.Provider>
  );
}

export default observer(MyApp);
