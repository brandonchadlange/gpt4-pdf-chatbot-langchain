import { AuthStateProvider } from '@/providers/auth';
import '@/styles/base.css';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import awsmobile from '../config/aws-amplify';

// Todo: need to tell the difference between Prod, Dev, and localhost. There will be three environements, not just the two below.
// Reference: https://docs.amplify.aws/lib/auth/social/q/platform/js/#full-sample

// Note:'window' below does not work in React
//
// const isLocalhost = Boolean(
//   window.location.hostname === 'localhost' ||
//     // [::1] is the IPv6 localhost address.
//     window.location.hostname === '[::1]' ||
//     // 127.0.0.1/8 is considered localhost for IPv4.
//     window.location.hostname.match(
//       /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
//     )
// );
const isLocalhost: Boolean = true;

// Assuming you have two redirect URIs, and the first is for production and second is for localhost
const [productionRedirectSignIn, localRedirectSignIn] =
  awsmobile.oauth.redirectSignIn.split(',');

const [productionRedirectSignOut, localRedirectSignOut] =
  awsmobile.oauth.redirectSignOut.split(',');

const updatedAwsConfig = {
  ...awsmobile,
  oauth: {
    ...awsmobile.oauth,
    redirectSignIn: isLocalhost
      ? localRedirectSignIn
      : productionRedirectSignIn,
    redirectSignOut: isLocalhost
      ? localRedirectSignOut
      : productionRedirectSignOut,
  },
};

Amplify.configure(updatedAwsConfig);

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <AuthStateProvider>
        <main className={inter.variable}>
          <Component {...pageProps} />
        </main>
      </AuthStateProvider>
    </>
  );
}

export default MyApp;
