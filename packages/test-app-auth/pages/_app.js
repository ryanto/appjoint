import '../styles/globals.css';
import { AppJoint, useAuth } from '@appjoint/react';
import { Login } from '../components/login';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }) {
  return (
    <AppJoint app="test-app-auth">
      <AuthenticatedApp>
        <Component {...pageProps} />
      </AuthenticatedApp>
    </AppJoint>
  );
}

let AuthenticatedApp = ({ children }) => {
  let { isInitializing, isAuthenticated } = useAuth();
  let router = useRouter();

  let publicUrls = ['/sign-in', '/create-account', '/create-account-form'];
  let isOnPublicPage = publicUrls.includes(router.asPath);

  return isInitializing ? (
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
