import '../styles/globals.css';
import { AppJoint, useAuth } from '@appjoint/react';
import { Login } from '../components/login';
import { useRouter } from 'next/router';
import { Suspense } from 'react';

export default function App({ Component, pageProps }) {
  return (
    <AppJoint app="test-app-auth">
      <Suspense fallback={<div data-test="suspended">Suspended</div>}>
        <AuthenticatedApp>
          <Component {...pageProps} />
        </AuthenticatedApp>
      </Suspense>
    </AppJoint>
  );
}

let AuthenticatedApp = ({ children }) => {
  let { isInitializing, isAuthenticated } = useAuth();
  let router = useRouter();

  let publicUrls = [
    '/sign-in',
    '/create-account',
    '/create-account-form',
    '/auth-token',
    '/suspense',
  ];

  let noSplashScreen = ['/suspense'];

  let isOnPublicPage = publicUrls.includes(router.asPath);
  let skipSplashScreen = noSplashScreen.includes(router.asPath);

  return isInitializing && !skipSplashScreen ? (
    // Display a splash screen until we know if the user is logged in
    <SplashScreen />
  ) : isAuthenticated || isOnPublicPage ? (
    // Render the children
    <>{children}</>
  ) : (
    // The user isn't logged in, show them the login screen.
    <Login />
  );
};

// We'll keep the page blank until we know if the user is logged in or not.
let SplashScreen = () => <>Loading</>;
