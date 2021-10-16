import { AppProps } from './lib/next';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
