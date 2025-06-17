import type { AppProps } from 'next/app';
import { ColorModeProvider } from '../theme/ColorModeContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ColorModeProvider>
      <Component {...pageProps} />
    </ColorModeProvider>
  );
}
