import { AppJoint, useAuth } from "@appjoint/react";
import { Login } from "../components/login";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <AppJoint app="Demo-app-hpdwq">
      <InnerApp>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </InnerApp>
    </AppJoint>
  );
}

function InnerApp({ children }) {
  let { isInitializing, isAuthenticated } = useAuth();

  return isInitializing ? <></> : isAuthenticated ? children : <Login />;
}

function Layout({ children }) {
  return (
    <div className=" lex flex-col min-h-screen">
      <div className="grow">{children}</div>
    </div>
  );
}

export default MyApp;
