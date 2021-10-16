import { AppProps } from './lib/next';

export default function App<Props>({ Component, pageProps }: AppProps<Props>) {
  return <Component {...pageProps} />
}
